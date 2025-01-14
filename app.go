package main

import (
	"app/backend/db"
	"app/backend/handlers"
	objectsAPI "app/backend/handlers"
	"app/backend/models"
	"app/backend/repositories"
	stateAPI "app/backend/state"
	"app/backend/util"
	"context"
	"encoding/json"
	"fmt"
	"net/url"

	"go.uber.org/zap"
)

// App struct
type App struct {
	ctx      context.Context
	logger   *zap.Logger
	handlers *handlers.Handlers
}

// NewApp creates a new App application struct
func NewApp() *App {
	logger := zap.Must(zap.NewDevelopment())
	logger.Info("Creating App Struct")
	database, err := db.InitDB(logger)
	db.CreateTables(database)
	fmt.Print("\n\nMIGRATED DB\n\n")
	repos := repositories.NewRepositories(database)
	handlers := handlers.NewHandlers(repos)
	defer logger.Sync()
	// go ai.StartServer()

	if err != nil {
		logger.Error("Error initializing database", zap.Error(err))
		panic("Error initializing database")
	}

	return &App{
		logger:   logger,
		handlers: handlers,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) ReadObjectFile(objectID string) (string, error) {
	data, err := objectsAPI.ReadObjectFile(objectID, a.logger)
	if err != nil {
		return "", err
	}
	return data, nil
}

func (a *App) CreateObject(objectJSON string) error {
	object := &models.Object{}
	err := json.Unmarshal([]byte(objectJSON), object)
	if err != nil {
		a.logger.Error("Error unmarshaling object", zap.Error(err))
		return err
	}
	err = a.handlers.ObjectHandler.CreateObject(object, a.logger)
	if err != nil {
		a.logger.Error("Error creating object", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) GetObject(objectID string) (string, error) {
	data, err := a.handlers.ObjectHandler.GetObject(objectID, a.logger)
	if err != nil {
		a.logger.Error("Error getting object", zap.Error(err))
		return "", err
	}
	json_string, err := json.Marshal(data)
	if err != nil {
		a.logger.Error("Error marshaling data to JSON", zap.Error(err))
		return "", err
	}
	return string(json_string), nil
}

func (a *App) UpdateObject(objectJSON string) error {
	object := &models.Object{}
	err := json.Unmarshal([]byte(objectJSON), object)
	if err != nil {
		a.logger.Error("Error unmarshaling object", zap.Error(err))
		return err
	}
	err = a.handlers.ObjectHandler.UpdateObject(object, a.logger)
	if err != nil {
		a.logger.Error("Error updating object", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) WriteObjectFile(objectID string, object string) error {
	err := objectsAPI.WriteObjectFile(objectID, object, a.logger)
	if err != nil {
		a.logger.Error("Error writing object file", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) DeleteObjectFile(objectID string) error {
	err := objectsAPI.DeleteObjectFile(objectID, a.logger)
	if err != nil {
		a.logger.Error("Error deleting object file", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) GetAllObjects() ([]string, error) {
	data, err := a.handlers.ObjectHandler.GetAllObjectIDs(a.logger)
	if err != nil {
		a.logger.Error("Error getting all objects", zap.Error(err))
		return nil, err
	}
	return data, nil
}

func (a *App) ReadObjectTypeFile(objectTypeID string) (string, error) {
	data, err := a.handlers.ObjectTypeHandler.GetObjectType(objectTypeID, a.logger)
	if err != nil {
		a.logger.Error("Error reading object file", zap.Error(err))
		return "", err
	}
	json_string, err := json.Marshal(data)
	if err != nil {
		a.logger.Error("Error marshaling data to JSON", zap.Error(err))
		return "", err
	}
	return string(json_string), nil
}

func (a *App) CreateObjectType(objectTypeString string) error {
	objectType := &models.ObjectType{}
	err := json.Unmarshal([]byte(objectTypeString), objectType)
	if err != nil {
		a.logger.Error("Error unmarshaling object type", zap.Error(err))
		return err
	}
	err = a.handlers.ObjectTypeHandler.CreateObjectType(objectType, a.logger)
	if err != nil {
		a.logger.Error("Error creating object type", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) DeleteObjectType(objectTypeID string) error {
	err := a.handlers.ObjectTypeHandler.DeleteObjectType(objectTypeID, a.logger)
	if err != nil {
		a.logger.Error("Error deleting object type", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) WriteObjectTypeFile(objectTypeID string, objectType string) error {
	err := objectsAPI.WriteObjectTypeFile(objectTypeID, objectType, a.logger)
	if err != nil {
		a.logger.Error("Error writing object type file", zap.Error(err))
		return err
	}
	return nil
}

func (a *App) GetAllObjectTypeFiles() ([]string, error) {
	data, err := a.handlers.ObjectTypeHandler.GetAllObjectTypeIDs(a.logger)
	if err != nil {
		a.logger.Error("Error getting all object type files", zap.Error(err))
		return nil, err
	}
	return data, nil
}

func (a *App) GetSummary(text string) (string, error) {
	a.logger.Info("Getting summary for", zap.String("text", text))
	baseURL := "http://localhost:8085/summarize?text="
	// URL-encode the query string to make it safe
	encodedQuery := url.QueryEscape(text)

	// Build the full URL with the encoded query
	fullURL := fmt.Sprintf("%s?text=%s", baseURL, encodedQuery)

	summary, err := util.SendRequest(fullURL)
	if err != nil {
		a.logger.Error("Error getting summary", zap.Error(err))
		return "", err
	}
	return string(summary), nil
}

func (a *App) GetChat(text string) (string, error) {
	a.logger.Info("Getting chat for", zap.String("text", text))
	baseURL := "http://localhost:8085/chat"
	// URL-encode the query string to make it safe
	encodedQuery := url.QueryEscape(text)

	// Build the full URL with the encoded query
	fullURL := fmt.Sprintf("%s?text=%s", baseURL, encodedQuery)
	// Build the full URL with the encoded query

	chat, err := util.SendRequest(fullURL)
	if err != nil {
		a.logger.Error("Error getting chat", zap.Error(err))
		return "", err
	}
	return string(chat), nil
}

func (a *App) ReadStateFile() (string, error) {
	data, err := stateAPI.ReadStateFile(a.logger)
	if err != nil {
		return "", err
	}
	return data, nil
}

func (a *App) WriteStateFile(state string) error {
	err := stateAPI.WriteStateFile(state, a.logger)
	if err != nil {
		a.logger.Error("Error writing state file", zap.Error(err))
		return err
	}
	return nil
}
