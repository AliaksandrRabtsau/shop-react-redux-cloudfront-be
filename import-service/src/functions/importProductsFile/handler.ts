import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';

import schema from './schema';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('importProductsFile', event.queryStringParameters);

  try {
    const { name } = event.queryStringParameters;
    if (!name) {
      throw new Error('No parameter "name" specified');
    }

    const s3client = new S3Client({ region: process.env.AWS_REGION })
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `uploaded/${name}`
    });
    const signedUrl = await getSignedUrl(s3client, command, { expiresIn: 3600 });

    console.log('importProductsFile', signedUrl);

    return formatJSONResponse(signedUrl);
  } catch (e) {
    return formatJSONResponse(e.message, 500);
  }
};

export const main = middyfy(importProductsFile);