package ai

import (
	"app/backend/repositories"
	"context"
	"encoding/json"
	"net/http"

	"github.com/openai/openai-go" // imported as openai
	"github.com/openai/openai-go/option"
	"go.uber.org/zap"
)

func CreateLMStudioClient(logger *zap.Logger) *openai.Client {
	client, err := CreateClient("your-api-token", "http://127.0.0.1:1234/v1")
	if err != nil {
		logger.Error("Error creating client", zap.Error(err))
		return nil

	}
	return client
}

func CreateClient(apiToken string, baseURL string) (*openai.Client, error) {
	client := openai.NewClient(
		option.WithAPIKey(apiToken),
		option.WithBaseURL(baseURL),
		option.WithMiddleware(func(r *http.Request, mn option.MiddlewareNext) (*http.Response, error) {
			r.URL.Path = "/v1" + r.URL.Path
			return mn(r)
		}),
	)

	return client, nil

}

func SendMessage(client *openai.Client, message string, logger *zap.Logger, objectRepository *repositories.ObjectRepository, currentObjectID string) (string, error) {
	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(message),
		}),
		Model: openai.F("qwen2.5-7b-instruct"),
		Tools: openai.F([]openai.ChatCompletionToolParam{
			{
				Type: openai.F(openai.ChatCompletionToolTypeFunction),
				Function: openai.F(openai.FunctionDefinitionParam{
					Name:        openai.String("add_content_to_current_object"),
					Description: openai.String("Adds content to the current object, the opened one."),
					Parameters: openai.F(openai.FunctionParameters{
						"type": "object",
						"properties": map[string]interface{}{
							"new_content": map[string]string{
								"type": "string",
							},
						},
						"required": []string{"new_content"},
					}),
				}),
			},
		}),
	})
	if err != nil {
		logger.Error("Error sending message", zap.Error(err))
		return "Error with this message", err
	}

	if len(chatCompletion.Choices) == 0 {
		return "No choices", nil
	}
	if len(chatCompletion.Choices[0].Message.ToolCalls) != 0 {
		for _, toolCall := range chatCompletion.Choices[0].Message.ToolCalls {
			if toolCall.Function.Name == "add_content_to_current_object" {
				var args map[string]interface{}
				json.Unmarshal([]byte(toolCall.Function.Arguments), &args)
				logger.Sugar().Log(1, args)
				objectRepository.AddNewContentToObject(
					currentObjectID,
					args["new_content"].(string),
				)
				return "$TOOL_USAGE: Adding content to object...", nil
			}
		}
	}
	return chatCompletion.Choices[0].Message.Content, nil
}
