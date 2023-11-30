import type { AWS } from '@serverless/typescript';

import {
  getProducts,
  getProductById,
  createProduct,
  catalogBatchProcess1,
} from '@functions/index';


const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE_NAME: 'Products_table',
      STOCKS_TABLE_NAME: 'Stocks_table',
      CREATE_PRODUCT_TOPIC_ARN: { 'Ref': 'createProductTopic' },
    },
    iam: {
      role: {
        name: 'DynamoDBfullaccessLambdasServeless',
        managedPolicies: ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
        statements: [
          {
            Effect: 'Allow',
            Action: 'SQS:*',
            Resource: '${self:provider.environment.CREATE_PRODUCT_TOPIC_ARN}',
          }
        ]
      },
    },
  },
  // import the function via paths
  functions: {
    getProducts,
    getProductById,
    createProduct,
    catalogBatchProcess1,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'products-queue1',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'products-topic',
          Subscription: [
            {
              Protocol: 'email',
              Endpoint: 'goodspeed.ar@gmail.com',
            },
          ],
        },
      },
      createProductTopicSubscriptionByPrice: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'console2005@ya.ru',
          TopicArn: '${self:provider.environment.CREATE_PRODUCT_TOPIC_ARN}',
          // TopicArn: 'arn:aws:sns:eu-west-1:715296600547:products',
          FilterPolicyScope: 'MessageBody',
          FilterPolicy: {
            price: [{ numeric: ['>', 10, '<=', 20] }],
          },
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
