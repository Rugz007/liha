package handlers

import (
	"app/backend/models"
	"app/backend/repositories"
	"app/backend/util"
	"fmt"
	"os"
	"strings"

	"github.com/adrg/xdg"
	"go.uber.org/zap"
)

type ObjectHandler struct {
	objectRepository       *repositories.ObjectRepository
	propertyTypeRepository *repositories.PropertyTypeRepository
}

func NewObjectHandler(
	objectRepository *repositories.ObjectRepository,
	propertyTypeRepository *repositories.PropertyTypeRepository,
) *ObjectHandler {
	return &ObjectHandler{objectRepository, propertyTypeRepository}
}

// DEPRECATED
func getObjectFilePath(objectID string) (string, error) {
	filepath, err := xdg.DataFile("liha/objects/" + objectID + ".json")
	if err != nil {
		return "", err
	}
	return filepath, nil
}

func (o *ObjectHandler) GetAllObjectIDs(logger *zap.Logger) ([]string, error) {
	objectIDs, err := o.objectRepository.GetObjectIDs("")
	if err != nil {
		logger.Error("Error getting objects", zap.Error(err))
		return nil, err
	}
	return objectIDs, nil
}

func (o *ObjectHandler) CreateObject(object *models.Object, logger *zap.Logger) error {
	objectTypeId := object.ObjectTypeID
	propertyTypes, err := o.propertyTypeRepository.GetPropertyTypesOfObjectType(objectTypeId)
	if err != nil {
		logger.Error("Error getting property types of object type", zap.Error(err))
		return err
	}
	err = o.objectRepository.CreateObject(object, propertyTypes)
	if err != nil {
		logger.Error("Error creating object", zap.Error(err))
		return err
	}
	// Create the properties of the object
	return nil
}

func (o *ObjectHandler) GetObject(objectID string, logger *zap.Logger) (*models.Object, error) {
	object, err := o.objectRepository.GetObject(objectID)
	if err != nil {
		logger.Error("Error getting object", zap.Error(err))
		return nil, err
	}
	return &object, nil
}

func (o *ObjectHandler) UpdateObject(object *models.Object, logger *zap.Logger) error {
	objectTypeId := object.ObjectTypeID
	propertyTypes, err := o.propertyTypeRepository.GetPropertyTypesOfObjectType(objectTypeId)
	if err != nil {
		logger.Error("Error getting property types of object type", zap.Error(err))
		return err
	}
	err = o.objectRepository.UpdateObject(object, propertyTypes)
	if err != nil {
		logger.Error("Error updating object", zap.Error(err))
		return err
	}
	return nil
}

func ReadObjectFile(objectID string, logger *zap.Logger) (string, error) {
	path, err := getObjectFilePath(objectID)
	if err != nil {
		logger.Error("Error getting object file path", zap.Error(err))
		return "", err
	}
	return util.ReadJSONFile(path, logger)
}

func WriteObjectFile(objectID string, markdown string, logger *zap.Logger) error {
	path, err := getObjectFilePath(objectID)
	if err != nil {
		logger.Error("Error getting object file path", zap.Error(err))
		return err
	}

	markdownPath := strings.Replace(path, ".json", ".md", 1)

	err = os.WriteFile(markdownPath, []byte(markdown), 0644)
	if err != nil {
		logger.Error("Error writing markdown file", zap.Error(err))
		return err
	}

	logger.Info("Exported to", zap.String("path", markdownPath))
	fmt.Printf("\n\nExported to: %s\n\n", markdownPath)
	return nil
}

func DeleteObjectFile(objectID string, logger *zap.Logger) error {
	path, err := getObjectFilePath(objectID)
	if err != nil {
		logger.Error("Error getting object file path", zap.Error(err))
		return err
	}
	return util.DeleteFile(path, logger)
}
