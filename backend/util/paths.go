package util

import (
	"fmt"
)

const LIHA_FOLDER_NAME = "liha"
const LIHA_DB_NAME = "liha.db"

func GetDataDir() (string, error) {
	dirPath := "/Users/qwelian/Programs/apps/2b/db"
	fmt.Printf("db path: %s \n\n", dirPath)
	return dirPath, nil
}
