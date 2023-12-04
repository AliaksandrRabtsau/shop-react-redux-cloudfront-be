import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: 'aws-course-shop-bucket',
        event: 's3:ObjectCreated:*',
        cors: true,
        rules: [{
          prefix: 'uploaded/',
        }],
        existing: true,
      },
    },
  ],
};
