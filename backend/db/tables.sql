CREATE TABLE
  IF NOT EXISTS object_type (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    fixed BOOLEAN NOT NULL,
    base_object_type TEXT NOT NULL, -- This could be an ENUM or TEXT field
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS property_type (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL, -- ENUM-like behavior can be handled in the application
    name TEXT NOT NULL,
    ai_automated BOOLEAN NOT NULL DEFAULT FALSE,
    visibility TEXT,
    default_value TEXT,
    is_object_reference BOOLEAN DEFAULT FALSE, -- Indicates if this property is an object reference
    object_type_id TEXT REFERENCES object_type (id) ON DELETE SET NULL -- Foreign key to object_type, allows referencing an object
  );

CREATE TABLE
  IF NOT EXISTS object (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    page_customization TEXT,
    contents TEXT,
    object_type_id TEXT REFERENCES object_type (id) ON DELETE CASCADE, -- Foreign key to object_type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pinned BOOLEAN DEFAULT FALSE
  );

CREATE TABLE
  IF NOT EXISTS property (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    object_id TEXT REFERENCES object (id) ON DELETE CASCADE, -- Foreign key to object
    property_type_id TEXT REFERENCES property_type (id) ON DELETE CASCADE, -- Foreign key to property_type
    value TEXT,
    value_number REAL,
    value_boolean BOOLEAN DEFAULT FALSE,
    value_date DATETIME,
    referenced_object_id TEXT REFERENCES object (id) ON DELETE SET NULL -- Optional: references another object if this property is an object reference
  );

CREATE TABLE
  IF NOT EXISTS collection (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    object_type_id TEXT REFERENCES object_type (id) ON DELETE CASCADE, -- Foreign key to object_type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    query TEXT,
    all_objects BOOLEAN DEFAULT FALSE,
    exclude_properties TEXT
  );

CREATE TRIGGER IF NOT EXISTS create_collection_after_object_type_insert
AFTER INSERT ON object_type
FOR EACH ROW
BEGIN
  INSERT INTO collection (id, name, description, object_type_id, query, all_objects)
  VALUES (
    NEW.id,
    'All ' || NEW.name,
    'Collection for all ' || NEW.name,
    NEW.id,
    'SELECT id FROM object WHERE object_type_id = ''' || NEW.id || '''',
    TRUE
  );
END;

CREATE TABLE IF NOT EXISTS conversation (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message (
  id TEXT PRIMARY KEY NOT NULL,
  conversation_id TEXT REFERENCES conversation (id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  object_id TEXT REFERENCES object (id) ON DELETE CASCADE,
  temperature REAL NOT NULL,
  model_used TEXT NOT NULL,
  citations TEXT
);