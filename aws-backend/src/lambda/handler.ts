import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

const createResponse = (
  statusCode: number,
  body: any
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: corsHeaders,
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    if (path === "/users") {
      switch (method) {
        case "GET":
          return GetAllUsers(event);
        case "POST":
          return CreateUser(event);
      }
    }

    if (path.startsWith("/users/{id}/{word}")) {
      const word = path.split("/users/{id}/")[1];

      if (word.length == 0) {
        return createResponse(400, { message: "No words Saved" });
      }
    }

    if (path.startsWith("/users/")) {
      const userId = path.split("/users/")[1];

      if (!userId) {
        return createResponse(400, { message: "User ID is required" });
      }
      switch (method) {
        case "GET":
          return GetUserData(userId);
        case "PUT":
          return UpdateUser(event, userId);
        case "DELETE":
          return DeleteUser(userId);
      }
    }

    return createResponse(404, { message: "Data not found" });
  } catch (error) {
    console.error("Caught error in Lambda :", error);
    return createResponse(500, { message: "Internal Server Error" });
  }
};

async function GetUserData(userId: string): Promise<APIGatewayProxyResultV2> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    })
  );
  if (!result.Item) {
    return createResponse(404, { message: "User not found" });
  }
  return createResponse(200, result.Item);
}

async function CreateUser(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const userId = uuidv4();
  const { name, email } = JSON.parse(event.body!);

  const user = {
    id: userId,
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

async function UpdateUser(
  event: APIGatewayProxyEventV2,
  userId: string
): Promise<APIGatewayProxyResultV2> {
  const { name, email } = JSON.parse(event.body!);

  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
      UpdateExpression: "SET #name = :name, #email = :email",
      ExpressionAttributeNames: {
        "#name": "name",
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":name": name || null,
        ":email": email || null,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Attributes),
  };
}

async function GetAllUsers(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const result = await dynamodb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

async function DeleteUser(userId: string): Promise<APIGatewayProxyResultV2> {
  await dynamodb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    })
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User deleted" }),
  };
}
