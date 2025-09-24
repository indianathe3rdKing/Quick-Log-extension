import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as apigateway_intergrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { QuickLogDynamoDBStack } from "./dynamodb-stack";
import { Method } from "aws-cdk-lib/aws-apigateway";

interface AwsBackendStackProps extends cdk.StackProps {
  quickLogDynamoDBStack: QuickLogDynamoDBStack;
}

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsBackendStackProps) {
    super(scope, id, props);

    //Create a single Lambda function for all operations
    const useHandler = new NodejsFunction(this, "UserHandler", {
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../src/lambda/handler.ts"),
      handler: "handler",
      functionName: `${this.stackName}-handler`,
      environment: {
        TABLE_NAME: props.quickLogDynamoDBStack.usersTable.tableName,
      },
    });

    props.quickLogDynamoDBStack.usersTable.grantReadWriteData(useHandler);

    const httpApi = new apigateway.HttpApi(this, "UserDataApi", {
      apiName: `${this.stackName}-quick-log-api`,
      description: "API for users saved words to the cloud",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });

    // Define routes for the API

    const routes = [
      {
        path: "/users",
        method: apigateway.HttpMethod.GET,
        name: "GetAllUsers",
      },
      {
        path: "/users",
        method: apigateway.HttpMethod.POST,
        name: "CreateUser",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.PUT,
        name: "UpdateUser",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.GET,
        name: "GetUserData",
      },
      {
        path: "/users/{id}",
        method: apigateway.HttpMethod.DELETE,
        name: "DeleteUser",
      },
      {
        path: "/users/{id}/words",
        method: apigateway.HttpMethod.POST,
        name: "SaveWord",
      },
      {
        path: "/users/{id}/words",
        method: apigateway.HttpMethod.DELETE,
        name: "DeleteWord",
      },

      {
        path: "/users/{id}/words",
        method: apigateway.HttpMethod.GET,
        name: "AllWords",
      },
      {
        path: "/login",
        method: apigateway.HttpMethod.POST,
        name: "loginUser",
      },
    ];

    //Create routes
    routes.forEach(({ path, method, name }) => {
      httpApi.addRoutes({
        path,
        methods: [method],
        integration: new apigateway_intergrations.HttpLambdaIntegration(
          `${name}Integration`,
          useHandler
        ),
      });
    });

    new cdk.CfnOutput(this, "HttpApiUrl", {
      value: httpApi.url ?? "",
      description: "HTTP API URL",
    });
  }
}
