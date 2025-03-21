package db

import (
	"app/backend/models"
	"app/backend/repositories"
	"database/sql"
	"encoding/json"
	"log"
	"os"
)

func CreateTables(db *sql.DB) (err error) {
	// Read the SQL file
	sqlFile, err := os.ReadFile("./backend/db/tables.sql")
	if err != nil {
		log.Printf("Failed to read SQL file: %v", err)
		return err
	}

	// Execute the SQL commands
	_, err = db.Exec(string(sqlFile))
	if err != nil {
		log.Printf("Failed to execute SQL commands: %v", err)
		return err
	}
	return nil
}

// func PopulateObjects(db *sql.DB) {
// 	// Read the SQL file
// 	sqlFile, err := os.ReadFile("./objects.sql")
// 	if err != nil {
// 		log.Fatalf("Failed to read SQL file: %v", err)
// 	}

// 	// Execute the SQL commands
// 	_, err = db.Exec(string(sqlFile))
// 	if err != nil {
// 		log.Fatalf("Failed to execute SQL commands: %v", err)
// 	}
// }

func PopulateObjects(repos *repositories.Repositories) {
	// Read the task_object_type.json from fixtures and marshal it into a struct
	objectTypeJSON, err := os.ReadFile("./backend/db/fixtures/task_object_type.json")
	if err != nil {
		panic(err)
	}

	var objectType models.ObjectType
	err = json.Unmarshal(objectTypeJSON, &objectType)
	if err != nil {
		panic(err)

	}

	// check if object type exists
	if !repos.ObjectTypeRepository.DoesObjectTypeExist(objectType.ID) {
		// create object type
		err = repos.ObjectTypeRepository.CreateObjectType(&objectType)
		if err != nil {
			panic(err)
		}
		log.Printf("Task Object type created successfully")
		return
	}
	log.Printf("Task Object type already exists")
}
