import { StackContext, Api, StaticSite } from "@serverless-stack/resources";

export function MyStack({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /": "functions/lambda.handler",
      "POST /translate": "functions/lambda.handler",
    },
  });

  api.attachPermissionsToRoute("POST /translate", ["translate:*"]);

  const site = new StaticSite(stack, "react", {
    path: "frontend",
    buildOutput: "dist",
    buildCommand: "yarn build",
    environment: {
      VITE_API_URL: api.url,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    WebSite: site.url,
  });
}
