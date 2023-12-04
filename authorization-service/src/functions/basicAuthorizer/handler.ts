import type {
  APIGatewayRequestIAMAuthorizerHandlerV2,
  APIGatewayIAMAuthorizerResult,
} from "aws-lambda"
import { middyfy } from '@libs/lambda';

const basicAuthorizer: APIGatewayRequestIAMAuthorizerHandlerV2 = async (event) => {
  console.log('event: ', JSON.stringify(event));
  if (event.type !== 'REQUEST') {
    throw 'Unauthorized';
  }

  try {
    const authToken = event.identitySource[0];
    const encodedCredentials = authToken.split(' ')[1];
    const buffer = Buffer.from(encodedCredentials, 'base64');
    const [username, password] = buffer.toString('utf-8').split(':');

    console.log(` username: "${username}" password: "${password}"`);

    const envPassword = process.env[username];
    const effect = !envPassword || envPassword !== password ? 'Deny' : 'Allow';
    return generatePolicy(encodedCredentials, event.routeArn, effect);

  } catch (e) {
    throw `Unauthorized: ${e.message}`;
  }
};

const generatePolicy = (principalId: string, resource: string, effect: string = 'Allow') => {
  const policy: APIGatewayIAMAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };
  return policy;
}

export const main = middyfy(basicAuthorizer);