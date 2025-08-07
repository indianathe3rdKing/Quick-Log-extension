#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AwsBackendStack } from "../lib/aws-backend-stack";
import { QuickLogDynamoDBStack } from "../lib/dynamodb-stack";

const app = new cdk.App();

const quickLogDynamoDBStack = new QuickLogDynamoDBStack(
  app,
  "QuickLogDynamoDBStack",
  {}
);

const awsBackendStack = new AwsBackendStack(app, "AwsBackendStack", {
  quickLogDynamoDBStack,
});

awsBackendStack.addDependency(quickLogDynamoDBStack);
