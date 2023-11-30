import { DynamoDB } from 'aws-sdk';
import { IProduct, IStock } from '@models/Product';

const joinArrays = ({ a, b, idName, foreignIdName }) => {
  const map = {};
  a.forEach((item) => {
    map[item[idName]] = item;
  })

  b.forEach((item) => {
    const { [foreignIdName]: id, ...rest } = item;
    if (map[id]) {
      map[id] = { ...map[id], ...rest }
    }
  })

  return Object.values(map);
}

class DynamoService {
  private static dynamo = new DynamoDB.DocumentClient();
  private static productsTableName = process.env.PRODUCTS_TABLE_NAME
  private static stocksTableName = process.env.STOCKS_TABLE_NAME

  static async scan<T>(tableName: string) {
    const result = await DynamoService.dynamo.scan({
      TableName: tableName,
    }).promise();
    return result.Items as Array<T>;
  }

  static async put<T>(tableName: string, item: T) {
    return DynamoService.dynamo.put({
      TableName: tableName,
      Item: item,
    }).promise();
  }

  static getProducts = async () => {
    return DynamoService.scan<IProduct>(DynamoService.productsTableName)
  }

  static getStocks = async () => {
    return DynamoService.scan<IStock>(DynamoService.stocksTableName)
  }

  static getProductStocks = async () => {
    const [products, stocks] = await Promise.all([ DynamoService.getProducts(), DynamoService.getStocks() ]);
    const productStocks = joinArrays({
      a: products,
      b: stocks,
      idName: 'id',
      foreignIdName: 'product_id',
    }) as Array<any>;
    return productStocks;
  }

  static createProduct = async (product: IProduct) => {
    return DynamoService.put(DynamoService.productsTableName, product);
  }

  static putWithTransaction = async (product: IProduct, stock: IStock) => {
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: DynamoService.productsTableName,
            Item: product,
          },
        },
        {
          Put: {
            TableName: DynamoService.stocksTableName,
            Item: stock,
          },
        },
      ]
    };
    return DynamoService.dynamo.transactWrite(params).promise();
  }
}

const getProductStocks: () => Promise<Array<any>> = async () => {
  return await DynamoService.getProductStocks();
}

const getProductStockById: (productId: string) => Promise<any> = async (productId) => {
  const products = await getProductStocks();
  const product = products.find(p => p.id === productId);
  if (!product) {
    throw new Error(`Product "${productId}" not found`);
  }
  return product;
}

const createProductMethod: (product: IProduct) => Promise<any> = async (product) => {
  return await DynamoService.createProduct(product);
}

const createProductTransaction: (product: IProduct, stock: IStock) => Promise<any> = async (product, stock) => {
  return await DynamoService.putWithTransaction(product, stock);
}

export {
  getProductStocks,
  getProductStockById,
  createProductMethod,
  createProductTransaction,
}