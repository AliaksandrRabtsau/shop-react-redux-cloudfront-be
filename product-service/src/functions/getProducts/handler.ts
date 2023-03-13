import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
// import { products } from '../../../mocks/mocks';
// import { IProduct } from 'src/models/Product';

import { getProductStocks } from '@libs/dynamo-service';

import schema from './schema';

const getProducts: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    console.log('Dynamo:event:getProductsList');
    const products = await getProductStocks();
    console.log('Dynamo:result:getProductsList', products);
    return formatJSONResponse(products);
  } catch (e) {
    return formatJSONResponse({ error: e.message }, 500);
  }
};

// const getProducts: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
//   const products = await getProductsTimeOut();
//   return formatJSONResponse(products);
// };

// const getProductsTimeOut: () => Promise<Array<IProduct>> = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(products), 0);
//   })
// };

export const main = middyfy(getProducts);
