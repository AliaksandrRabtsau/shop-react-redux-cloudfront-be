import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { createProductMethod } from '@libs/dynamo-service';
import { v4 as uuidv4 } from 'uuid';

import schema from './schema';

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { title, description = '', price } = event.body;
    if (!title || !description || !price) {
      console.log('error');
    }

    const uuid = uuidv4();
    const result = await createProductMethod({ id: uuid, title, description, price });

    return formatJSONResponse(result);
  } catch (e) {
    if (e) {
      return formatJSONResponse({ error: e.message }, 400);
    }
    return formatJSONResponse({ error: e.message }, 500);
  }
};

export const main = middyfy(createProduct);
