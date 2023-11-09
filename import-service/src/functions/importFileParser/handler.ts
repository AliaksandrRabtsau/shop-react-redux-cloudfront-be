import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { parseCsvStream } from '@utils/parse-csv';

const importFileParser = async (event) => {
  console.log('importFileParser', event);
  try {
    const s3client = new S3Client({ region: process.env.AWS_REGION });

    for (const record of event.Records) {
      const s3Data = await s3client.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.s3.object.key,
      }));

      await parseCsvStream(s3Data.Body as NodeJS.ReadableStream);

      await s3client.send(new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET,
        CopySource: process.env.S3_BUCKET + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed'),
      }));

      await s3client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.s3.object.key,
      }));

      console.log('Parsed file ' + record.s3.object.key.split('/')[1] + ' finished');
    }
  } catch (e) {
    console.log('error', e);
  }
};

export const main = importFileParser;