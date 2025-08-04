import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

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

    if (path.startsWith("/users/")) {
      const userId = path.split("/users/")[2];

      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "User ID is required" }),
        };
      }
      switch (method) {
        case "GET":
          return GetUserdata(userId);
        case "PUT":
          return UpdateUser(event);
        case "DELETE":
          return DeleteUser(userId);
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: " Data not found" }),
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

async function GetUserdata(userId: string): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User data created successfully" }),
  };
}

async function CreateUser(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User created successfully" }),
  };
}

async function UpdateUser(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "User updated successfully",
    }),
  };
}

async function GetAllUsers(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "All users displayed" }),
  };
}

async function DeleteUser(userId: string): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User deleted" }),
  };
}
