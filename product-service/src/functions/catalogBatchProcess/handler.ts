import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';
import { SQSEvent } from 'aws-lambda';
import { createProductTransaction as createProductRequest } from '@libs/dynamo-service';


const catalogBatchProcess1 = async (event: SQSEvent) => {
  console.log('SQSHandler:event:catalogBatchProcess1', event);

  try {
    const snsClient = new SNSClient({ region: process.env.AWS_REGION });

    for (const record of event.Records) {
      const { title, description = '', price, count } = JSON.parse(record.body);
      if (!title || !description || !price || !count) {
        throw new Error(`Product data is invalid for: ${record.body}`);
      }

      const uuid = uuidv4();
      const product =  { id: uuid, title, description, price: Number(price) };
      const stock =  { product_id: uuid, count: Number(count) };
      const result = await createProductRequest(product, stock);
      console.log('Dynamo:result:createProductWithStock', result);

      const snsResult = await snsClient.send(new PublishCommand({
        Subject: 'Products creation',
        Message: JSON.stringify(product),
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
      }));
      console.log('SNSPublishCommand:result finished with success', snsResult);
    }

    console.log('SQSHandler:result: function execution completed with success');
  } catch (e) {
    throw new Error('Error occured during event processing', e.message);
  }
};

export const main = catalogBatchProcess1;