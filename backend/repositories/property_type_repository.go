package repositories

import (
	"app/backend/models"
	"database/sql"
)

// Table: property_type
//  CREATE TABLE
//   IF NOT EXISTS property_type (
//     id TEXT PRIMARY KEY,
//     type TEXT NOT NULL, -- ENUM-like behavior can be handled in the application
//     name TEXT NOT NULL,
//     ai_automated BOOLEAN,
//     visibility TEXT,
//     icon TEXT,
//     default_value TEXT,
//     is_object_reference BOOLEAN DEFAULT FALSE, -- Indicates if this property is an object reference
//     object_type_id TEXT REFERENCES object_type (id) ON DELETE SET NULL -- Foreign key to object_type, allows referencing an object
//   );

type PropertyTypeRepository struct {
	db *sql.DB
}

func NewPropertyTypeRepository(db *sql.DB) *PropertyTypeRepository {
	return &PropertyTypeRepository{db}
}

func (repo *PropertyTypeRepository) CreatePropertyType(propertyType *models.PropertyType) error {
	_, err := repo.db.Exec(
		"INSERT INTO property_type (id, type, name, ai_automated, visibility, default_value, is_object_reference, object_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		propertyType.ID, propertyType.Type, propertyType.Name, propertyType.AIAutomated, propertyType.Visibility, propertyType.DefaultValue, propertyType.IsObjectReference, propertyType.ObjectTypeID,
	)
	return err
}

func (repo *PropertyTypeRepository) CreatePropertyTypes(propertyTypes *[]models.PropertyType) error {
	tx, err := repo.db.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare("INSERT INTO property_type (id, type, name, ai_automated, visibility, default_value, is_object_reference, object_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, propertyType := range *propertyTypes {

		_, err := stmt.Exec(propertyType.ID, propertyType.Type, propertyType.Name, propertyType.AIAutomated, propertyType.Visibility, propertyType.DefaultValue, propertyType.IsObjectReference, propertyType.ObjectTypeID)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

func (repo *PropertyTypeRepository) GetPropertyType(propertyTypeID string) (*models.PropertyType, error) {
	propertyType := &models.PropertyType{}
	err := repo.db.QueryRow(
		"SELECT id, type, name, ai_automated, visibility, default_value, is_object_reference, object_type_id FROM property_type WHERE id = $1",
		propertyTypeID,
	).Scan(&propertyType.ID, &propertyType.Type, &propertyType.Name, &propertyType.AIAutomated, &propertyType.Visibility, &propertyType.DefaultValue, &propertyType.IsObjectReference, &propertyType.ObjectTypeID)
	return propertyType, err
}

func (repo *PropertyTypeRepository) GetPropertyTypesIDs(filter string) ([]string, error) {
	query := "SELECT id FROM property_type"
	if filter != "" {
		query += " WHERE " + filter
	}

	rows, err := repo.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	propertyTypes := make([]string, 0)
	for rows.Next() {
		var propertyType string
		err := rows.Scan(&propertyType)
		if err != nil {
			return nil, err
		}
		propertyTypes = append(propertyTypes, propertyType)
	}

	return propertyTypes, nil
}

func (repo *PropertyTypeRepository) GetPropertyTypesOfObjectType(objectID string) (*[]models.PropertyType, error) {
	query := "SELECT id, type, name, ai_automated, visibility, default_value, is_object_reference, object_type_id FROM property_type WHERE object_type_id = $1"

	rows, err := repo.db.Query(query, objectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	propertyTypes := make([]models.PropertyType, 0)
	for rows.Next() {
		var propertyType models.PropertyType
		err := rows.Scan(&propertyType.ID, &propertyType.Type, &propertyType.Name, &propertyType.AIAutomated, &propertyType.Visibility, &propertyType.DefaultValue, &propertyType.IsObjectReference, &propertyType.ObjectTypeID)
		if err != nil {
			return nil, err
		}
		propertyTypes = append(propertyTypes, propertyType)
	}

	return &propertyTypes, nil
}
