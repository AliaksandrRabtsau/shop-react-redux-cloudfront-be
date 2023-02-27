import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../../mocks/mocks';
import { IProduct } from 'src/models/Product';

import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = await getProductByIdTimeOut(productId);
    return formatJSONResponse(product);
  } catch (e) {
    return formatJSONResponse({
      error: e
    });
  }
};

const getProducts: () => Promise<Array<IProduct>> = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(products), 0);
  })
};

const getProductByIdTimeOut: (productId: string | number) => Promise<IProduct> = async (productId) => {
  return new Promise(async (resolve, reject) => {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      reject(`Product "${productId}" not found`);
    }
    resolve(product);
  })
};

export const main = middyfy(getProductById);
