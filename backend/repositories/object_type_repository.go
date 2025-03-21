package repositories

import (
	"app/backend/models"
	"database/sql"
)

type ObjectTypeRepository struct {
	db *sql.DB
}

func NewObjectTypeRepository(db *sql.DB) *ObjectTypeRepository {
	return &ObjectTypeRepository{db}
}

func (repo *ObjectTypeRepository) CreateObjectType(objectType *models.ObjectType) error {
	_, err := repo.db.Exec(
		"INSERT INTO object_type (id, name, description, color, fixed, base_object_type) VALUES ($1, $2, $3, $4, $5, $6)",
		objectType.ID, objectType.Name, objectType.Description, objectType.Color, objectType.Fixed, objectType.BaseObjectType,
	)
	return err
}

func (repo *ObjectTypeRepository) DoesObjectTypeExist(objectTypeID string) bool {
	err := repo.db.QueryRow("SELECT id FROM object_type").Scan(&objectTypeID)
	return err == nil
}

func (repo *ObjectTypeRepository) GetObjectType(objectTypeID string) (*models.ObjectType, error) {
	objectType := &models.ObjectType{}
	err := repo.db.QueryRow(
		"SELECT id, name, description, color, fixed, base_object_type FROM object_type WHERE id = $1",
		objectTypeID,
	).Scan(&objectType.ID, &objectType.Name, &objectType.Description, &objectType.Color, &objectType.Fixed, &objectType.BaseObjectType)
	return objectType, err
}

func (repo *ObjectTypeRepository) GetObjectTypesIDs(filter string) ([]string, error) {
	query := "SELECT id FROM object_type"
	if filter != "" {
		query += " WHERE " + filter
	}

	rows, err := repo.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	objectTypes := make([]string, 0)
	for rows.Next() {
		var objectType string
		err := rows.Scan(&objectType)
		if err != nil {
			return nil, err
		}
		objectTypes = append(objectTypes, objectType)
	}

	return objectTypes, nil
}

func (repo *ObjectTypeRepository) UpdateObjectType(objectType *models.ObjectType) error {
	_, err := repo.db.Exec(
		"UPDATE object_type SET name = $1, description = $2, color = $3, fixed = $4, base_object_type = $5 WHERE id = $6",
		objectType.Name, objectType.Description, objectType.Color, objectType.Fixed, objectType.BaseObjectType, objectType.ID,
	)
	return err
}

func (repo *ObjectTypeRepository) DeleteObjectType(objectTypeID string) error {
	_, err := repo.db.Exec("DELETE FROM object_type WHERE id = $1", objectTypeID)
	return err
}
