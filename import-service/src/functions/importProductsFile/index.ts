import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: 'get',
        path: '/${self:provider.stage}/import',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
        authorizer: {
          name: 'basicAuthorizer',
        },
      },
    },
  ],
};