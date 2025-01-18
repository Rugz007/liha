package repositories

import (
	"app/backend/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ObjectRepository struct {
	db *sql.DB
}

func NewObjectRepository(db *sql.DB) *ObjectRepository {
	return &ObjectRepository{db}
}

func IsValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}

func (r *ObjectRepository) GetObjectIDs(filter string) ([]string, error) {
	rows, err := r.db.Query("SELECT id FROM object")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objectIDs []string
	for rows.Next() {
		var objectID string
		err := rows.Scan(&objectID)
		if err != nil {
			return nil, err
		}
		objectIDs = append(objectIDs, objectID)
	}
	return objectIDs, nil
}

func (r *ObjectRepository) GetObject(objectID string) (models.Object, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return models.Object{}, err
	}
	defer tx.Rollback()

	var object models.Object
	var pageCustomizationJSON, contentsJSON string
	err = tx.QueryRow(
		"SELECT id, name, description, object_type_id, page_customization, contents FROM object WHERE id = ?",
		objectID,
	).Scan(
		&object.ID,
		&object.Name,
		&object.Description,
		&object.ObjectTypeID,
		&pageCustomizationJSON,
		&contentsJSON,
	)
	if err != nil {
		return models.Object{}, err
	}

	err = json.Unmarshal([]byte(pageCustomizationJSON), &object.PageCustomization)
	if err != nil {
		return models.Object{}, err
	}

	err = json.Unmarshal([]byte(contentsJSON), &object.Contents)
	if err != nil {
		return models.Object{}, err
	}

	properties := map[string]models.Property{}
	rows, err := tx.Query(
		"SELECT property_type_id, value, value_number, value_boolean, value_date, object_id, referenced_object_id FROM property WHERE object_id = ?",
		objectID,
	)
	if err != nil {
		return models.Object{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var property models.Property
		err := rows.Scan(
			&property.ID,
			&property.Value,
			&property.ValueNumber,
			&property.ValueBoolean,
			&property.ValueDate,
			&property.ObjectID,
			&property.ReferencedObjectID,
		)
		if err != nil {
			return models.Object{}, err
		}
		properties[property.ID] = property
	}
	object.Properties = properties

	err = tx.Commit()
	if err != nil {
		return models.Object{}, err
	}

	return object, nil
}

func (r *ObjectRepository) CreateObject(object *models.Object, propertyTypes *[]models.PropertyType) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	pageCustomizationJSON, err := json.Marshal(object.PageCustomization)
	if err != nil {
		tx.Rollback()
		return err
	}
	contentJSON, err := json.Marshal(object.Contents)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(
		"INSERT INTO object (id, name, description, object_type_id, page_customization, contents) VALUES (?, ?, ?, ?, ?, ?)",
		object.ID, object.Name, object.Description, object.ObjectTypeID, string(pageCustomizationJSON), string(contentJSON),
	)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Loop through the property types and insert them into the property table
	for _, propertyType := range *propertyTypes {
		var query string
		switch propertyType.Type {
		case "text":
			query = "INSERT INTO property (object_id, property_type_id, value) VALUES (?, ?, ?)"
		case "number":
			query = "INSERT INTO property (object_id, property_type_id, value_number) VALUES (?, ?, ?)"
		case "boolean":
			query = "INSERT INTO property (object_id, property_type_id, value_boolean) VALUES (?, ?, ?)"
		case "date":
			query = "INSERT INTO property (object_id, property_type_id, value_date) VALUES (?, ?, ?)"
		default:
			query = "INSERT INTO property (object_id, property_type_id, referenced_object_id) VALUES (?, ?, ?)"
			// Check if propertyType.Type is valid UUID and insert it as a reference
			_, err := uuid.Parse(string(propertyType.Type))
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("unsupported property type: %s", propertyType.Type)
			}

		}

		var defaultValue any
		if propertyType.Type == models.BasePropertyTypeNumber {
			//Convert string to number
			defaultValue, err = strconv.ParseFloat(propertyType.DefaultValue, 64)
			if err != nil {
				tx.Rollback()
				return err
			}
		} else if propertyType.Type == models.BasePropertyTypeBoolean {
			//Convert string to boolean
			defaultValue, err = strconv.ParseBool(propertyType.DefaultValue)
			if err != nil {
				tx.Rollback()
				return err
			}
		} else if propertyType.Type == models.BasePropertyTypeDate {
			//Convert string to date
			defaultValueStr := strings.Trim(propertyType.DefaultValue, "\"")
			defaultValue, err = time.Parse(time.RFC3339, defaultValueStr)

			if err != nil {
				tx.Rollback()
				return err
			}
		} else {
			defaultValue = propertyType.DefaultValue
		}

		_, err = tx.Exec(query, object.ID, propertyType.ID, defaultValue)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *ObjectRepository) UpdateObject(object *models.Object, propertyTypes *[]models.PropertyType) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	pageCustomizationJSON, err := json.Marshal(object.PageCustomization)
	if err != nil {
		tx.Rollback()
		return err
	}
	contentJSON, err := json.Marshal(object.Contents)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(
		"UPDATE object SET name = ?, description = ?, object_type_id = ?, page_customization = ?, contents = ? WHERE id = ?",
		object.Name, object.Description, object.ObjectTypeID, string(pageCustomizationJSON), string(contentJSON), object.ID,
	)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Loop through the property types and update them into the property table.
	for _, propertyType := range *propertyTypes {
		var query string
		switch propertyType.Type {
		case "text":
			query = "UPDATE property SET value = ? WHERE object_id = ? AND property_type_id = ?"
		case "number":
			query = "UPDATE property SET value_number = ? WHERE object_id = ? AND property_type_id = ?"
		case "boolean":
			query = "UPDATE property SET value_boolean = ? WHERE object_id = ? AND property_type_id = ?"
		case "date":
			query = "UPDATE property SET value_date = ? WHERE object_id = ? AND property_type_id = ?"
		default:
			query = "UPDATE property SET referenced_object_id = ? WHERE object_id = ? AND property_type_id = ?"
			// Check if propertyType.Type is valid UUID and insert it as a reference
			_, err := uuid.Parse(string(propertyType.Type))
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("unsupported property type: %s", propertyType.Type)
			}
		}

		var value any
		if propertyType.Type == models.BasePropertyTypeNumber {
			value = object.Properties[propertyType.ID].ValueNumber
		} else if propertyType.Type == models.BasePropertyTypeBoolean {
			value = object.Properties[propertyType.ID].ValueBoolean
		} else if propertyType.Type == models.BasePropertyTypeDate {
			value = object.Properties[propertyType.ID].ValueDate
			//valid uuid type for reference
		} else if IsValidUUID(string(propertyType.Type)) {
			value = object.Properties[propertyType.ID].ReferencedObjectID
		} else {
			value = object.Properties[propertyType.ID].Value
		}

		_, err = tx.Exec(query, value, object.ID, propertyType.ID)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *ObjectRepository) DeleteObject(objectID string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM property WHERE object_id = ?", objectID)
	if err != nil {
		tx.Rollback()
		return err
	}
	return nil
}

func (r *ObjectRepository) AddNewContentToObject(objectID string, newContent string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	newContentID := uuid.New().String()
	contentObj := map[string]interface{}{
		"id":      newContentID,
		"type":    "text",
		"content": newContent,
		"x":       0,
		"y":       0,
		"w":       12,
		"h":       12,
	}

	var contents string
	err = tx.QueryRow("SELECT contents FROM object WHERE id = ?", objectID).Scan(&contents)
	if err != nil {
		tx.Rollback()
		return err
	}

	var contentsMap map[string]interface{}
	err = json.Unmarshal([]byte(contents), &contentsMap)
	if err != nil {
		tx.Rollback()
		return err
	}

	contentsMap[newContentID] = contentObj
	contentsJSON, err := json.Marshal(contentsMap)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("UPDATE object SET contents = ? WHERE id = ?", string(contentsJSON), objectID)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *ObjectRepository) GetRecentObjectsOfType(objectType string) ([]string, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	rows, err := tx.Query("SELECT id FROM object WHERE object_type_id = ? ORDER BY last_modified DESC LIMIT 5", objectType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objectIDs []string

	for rows.Next() {
		var objectID string
		err := rows.Scan(&objectID)
		if err != nil {
			return nil, err
		}
		objectIDs = append(objectIDs, objectID)
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return objectIDs, nil
}
