import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `body not specified`,
    };
  }

  const body = JSON.parse(event.body);
  const { text, language } = body;

  const translate = new AWS.Translate();

  const translateParams: AWS.Translate.Types.TranslateTextRequest = {
    Text: text,
    SourceLanguageCode: "en",
    TargetLanguageCode: language,
  };

  const translatedMessage = await translate
    .translateText(translateParams)
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      translatedMessage
    })
  };
};
