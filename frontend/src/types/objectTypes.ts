import { z } from "zod";

const DEFAULT_TAG_TYPE_UUID = "25783033-91c1-40ec-88a4-b70ae302a7d0";
const DEFAULT_TAG_LABEL_UUID = "ae29371b-1de4-4d3e-98f1-7328c76f562f";
const DEFAULT_TASK_TYPE_UUID = "c7e5ba56-9a07-4a9f-b9b6-0f78334c0591";

const VisibilitySchema = z.enum(["visible", "hidden", "hidden_empty"]);

const BasePropertyTypes = z.enum(["text", "number", "date", "boolean"]);
const BasePropertyDefaultValues = {
  text: "",
  number: 0,
  date: new Date(),
  boolean: false,
}

const BasePropertySchema = z.object({
  id: z.string().uuid(),
  type: BasePropertyTypes,
  name: z.string(),
  aiAutomated: z.boolean().optional(),
  visibility: VisibilitySchema.default("visible"),
  defaultValue: z.any().optional(),
  isObjectReference: z.boolean().default(false),
  objectTypeId: z.string().uuid().optional(),
});

const NumberFormats = z.enum(["number", "currency", "percent", "phone"]);

const DateDisplayFormats = z.enum([
  "date",
  "date_time",
  "time",
  "month_year",
  "year",
]);

const PropertySchema = z.union([
  BasePropertySchema.extend({
    type: z.literal("text"),
    name: z.string().default("Text"),
    defaultValue: z.string().optional().default(""),
  }),
  BasePropertySchema.extend({
    type: z.literal("number"),
    format: NumberFormats.default("number"), // Assuming NumberFormats is a Zod schema
    name: z.string().default("Number"),
    defaultValue: z.number().optional().default(0),
  }),
  BasePropertySchema.extend({
    type: z.literal("date"),
    format: DateDisplayFormats, // Assuming DateDisplayFormats is a Zod schema
    name: z.string().default("Date"),
    defaultValue: z.date().optional().default(new Date()),
  }),
  BasePropertySchema.extend({
    type: z.literal("boolean"),
    name: z.string().default("Boolean"),
    defaultValue: z.boolean().optional().default(false),
  }),
  BasePropertySchema.extend({
    type: z.string(),
    name: z.string().default("Object"),
    defaultValue: z.string().optional(),
  }),
]);

const DEFAULT_PROPERTY_VALUE = PropertySchema.parse({
  type: "text",
  name: "Text",
  visibility: "visible",
  defaultValue: "",
  isObjectReference: false,
  objectTypeId: undefined,
  id: "00000000-0000-0000-0000-000000000000",
});

const PropertyMapSchema = z.record(PropertySchema);

const BaseObjectTypes = z.enum([
  "page",
  "file",
  "video",
  "drawing",
  "task",
  "link",
  "note",
  "tag",
]);

const ObjectTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  baseType: BaseObjectTypes,
  description: z.string().optional(),
  color: z.string(),
  properties: PropertyMapSchema,
  fixed: z.boolean().default(false),
});

type ObjectProperty = z.infer<typeof PropertySchema>;
type ObjectPropertyMap = z.infer<typeof PropertyMapSchema>;
type ObjectType = z.infer<typeof ObjectTypeSchema>;
type PropertyTypeEnum = z.infer<typeof BasePropertyTypes>;

export type { ObjectProperty, ObjectType, ObjectPropertyMap, PropertyTypeEnum };

export {
  BasePropertyTypes as PropertyType,
  BasePropertyDefaultValues as PropertyDefaultValues,
  BasePropertySchema,
  PropertySchema,
  ObjectTypeSchema,
  DEFAULT_PROPERTY_VALUE,
  DEFAULT_TAG_TYPE_UUID,
  DEFAULT_TAG_LABEL_UUID,
  DEFAULT_TASK_TYPE_UUID,
  //   useObjectTypesStore,
};
