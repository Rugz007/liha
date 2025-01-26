package handlers

import (
	"app/backend/models"
	"app/backend/repositories"

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

func (o *ObjectHandler) GetRepository() *repositories.ObjectRepository {
	return o.objectRepository
}

func (o *ObjectHandler) GetRecentObjectsOfType(objectTypeID string, logger *zap.Logger) ([]string, error) {
	objectIDs, err := o.objectRepository.GetRecentObjectsOfType(objectTypeID)
	if err != nil {
		logger.Error("Error getting recent objects of type", zap.Error(err))
		return nil, err
	}
	return objectIDs, nil
}
