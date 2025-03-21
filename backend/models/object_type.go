package models

type BaseObjectType string
type BasePropertyType string

const (
	BasePropertyTypeString  BasePropertyType = "string"
	BasePropertyTypeNumber  BasePropertyType = "number"
	BasePropertyTypeBoolean BasePropertyType = "boolean"
	BasePropertyTypeDate    BasePropertyType = "date"
)

const (
	PageObjectType     BaseObjectType = "page"
	TagObjectType      BaseObjectType = "tag"
	GoogleCalEventType BaseObjectType = "google_cal_event"
	TaskObjectType     BaseObjectType = "task"
)

type ObjectType struct {
	ID             string                  `json:"id" db:"id"`
	Name           string                  `json:"name" db:"name"`
	Description    string                  `json:"description" db:"description"`
	Color          string                  `json:"color" db:"color"`
	Fixed          bool                    `json:"fixed" db:"fixed"`
	BaseObjectType BaseObjectType          `json:"baseType" db:"base_object_type"`
	PropertyTypes  map[string]PropertyType `json:"properties" db:"-"` // derived field
}

type PropertyType struct {
	ID                string           `json:"id" db:"id"`
	Type              BasePropertyType `json:"type" db:"type"`
	Name              string           `json:"name" db:"name"`
	AIAutomated       bool             `json:"aiAutomated" db:"ai_automated"`
	Visibility        string           `json:"visibility" db:"visibility"`
	DefaultValue      string           `json:"defaultValue" db:"default_value"`
	IsObjectReference bool             `json:"isObjectReference" db:"is_object_reference"`
	ObjectTypeID      *string          `json:"objectTypeId,omitempty" db:"object_type_id"`
}
