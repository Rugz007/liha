package models

import (
	"time"
)

type Object struct {
	ID                string              `json:"id" db:"id"`
	Name              string              `json:"title" db:"name"`
	Description       string              `json:"description,omitempty" db:"description"`
	ObjectTypeID      string              `json:"type" db:"object_type_id"`           // Foreign key to ObjectType
	Contents          map[string]Content  `json:"contents,omitempty" db:"-"`          // derived field
	PageCustomization PageCustomization   `json:"pageCustomization,omitempty" db:"-"` // derived field
	Properties        map[string]Property `json:"properties,omitempty" db:"-"`        // derived field
	Pinned            bool                `json:"pinned" db:"pinned"`
}

type Content struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Content string `json:"content"`
	X       int    `json:"x"`
	Y       int    `json:"y"`
	W       int    `json:"w"`
	H       int    `json:"h"`
}

type PageCustomization struct {
	BackgroundColor string `json:"backgroundColor"`
	BackgroundImage string `json:"backgroundImage"`
	DefaultFont     string `json:"defaultFont"`
	FreeDrag        bool   `json:"freeDrag"`
}

// Property represents the structure of the Property table.
type Property struct {
	ID                 string     `json:"id" db:"id"`                                             // Autoincrement field
	ObjectID           string     `json:"objectId" db:"object_id"`                                // Foreign key to Object
	PropertyTypeID     string     `json:"propertyTypeId" db:"property_type_id"`                   // Foreign key to PropertyType
	Value              *string    `json:"value,omitempty" db:"value"`                             // Optional string value
	ValueNumber        *float64   `json:"valueNumber,omitempty" db:"value_number"`                // Optional numeric value
	ValueBoolean       *bool      `json:"valueBoolean,omitempty" db:"value_boolean"`              // Optional boolean value
	ValueDate          *time.Time `json:"valueDate,omitempty" db:"value_date"`                    // Optional date value
	ReferencedObjectID *string    `json:"referencedObjectId,omitempty" db:"referenced_object_id"` // Optional foreign key to Object
}
