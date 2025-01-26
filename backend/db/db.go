package db

import (
	"app/backend/util"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3" // Import SQLite driver
	"go.uber.org/zap"
)

// InitDB initializes the database connection
func InitDB(log *zap.Logger) (*sql.DB, error) {
	var err error

	dataDir, _ := util.GetDataDir()

	// Create a new data directory if it doesn't exist
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		err = os.MkdirAll(dataDir, os.ModePerm)
		if err != nil {
			log.Sugar().Fatalf("Failed to create data directory: %v", err)
			return nil, err
		}
	}

	// Create a new SQLite database file if it doesn't exist
	dbFilePath := filepath.Join(dataDir, util.LIHA_DB_NAME)
	if _, err := os.Stat(dbFilePath); os.IsNotExist(err) {
		// Create the database file
		file, err := os.Create(dbFilePath)
		if err != nil {
			log.Sugar().Fatalf("Failed to create database file: %v", err)
		}
		defer file.Close()
	}

	// Open the SQLite database
	db, err := sql.Open("sqlite3", dbFilePath)
	if err != nil {
		log.Sugar().Fatalf("Failed to open database: %v", err)
		return nil, err
	}

	// Verify the connection
	if err = db.Ping(); err != nil {
		log.Sugar().Fatalf("Failed to ping database: %v", err)
		return nil, err
	}

	fmt.Println("Connected to the database successfully!")
	return db, nil
}

// CloseDB closes the database connection
func CloseDB(db *sql.DB) {
	if err := db.Close(); err != nil {
		log.Fatalf("Failed to close database: %v", err)
	}
}
