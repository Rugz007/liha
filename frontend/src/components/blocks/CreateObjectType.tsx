import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardTitle } from "@/components/ui/card";
import { EllipsisVertical, LucideX, PlusIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import {
  ALL_OBJECT_TYPE_QUERY_KEY,
  useAllObjectTypes,
  useAllObjectTypesIDs,
  useCreateObjectType,
  useObjectTypesUnsavedStore,
} from "../../store/objectTypesStore";
import {
  DEFAULT_PROPERTY_VALUE,
  ObjectProperty,
  ObjectPropertyMap,
  ObjectType,
  ObjectTypeSchema,
  PropertyDefaultValues,
  PropertyType,
  PropertyTypeEnum,
} from "../../types/objectTypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { v4 as uuid } from "uuid";
import { produce } from "immer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useTabsState } from "../../store/miscStore";
import PropertyTypeIcon from "../ui/property-type-icon";
import { cn } from "../../lib/utils";
const CreateObjectSchema = ObjectTypeSchema.omit({ id: true });

const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) => {
  const colors = [
    { name: "red-500", class: "bg-red-500" },
    { name: "yellow-500", class: "bg-yellow-500" },
    { name: "green-500", class: "bg-green-500" },
    { name: "blue-500", class: "bg-blue-500" },
    { name: "indigo-500", class: "bg-indigo-500" },
    { name: "purple-500", class: "bg-purple-500" },
    { name: "pink-500", class: "bg-pink-500" },
    { name: "gray-500", class: "bg-gray-500" },
  ];

  return (
    <div className="flex flex-shrink-0 space-x-2 py-1 mt-2">
      {colors.map((colorObj) => (
        <button
          key={colorObj.name}
          className={cn(
            "w-6 h-6 rounded-full transition-all duration-200 ease-in-out",
            colorObj.class,
            color === colorObj.name && "ring-2 ring-offset-2 ring-gray-400"
          )}
          onClick={(e) => {
            e.preventDefault();
            onChange(colorObj.name);
          }}
        />
      ))}
    </div>
  );
};
export default function CreateObjectType(props: { tabID: string }) {
  const { objectTypesMap, updateObjectType } = useObjectTypesUnsavedStore();
  const form = useForm<z.infer<typeof CreateObjectSchema>>({
    resolver: zodResolver(CreateObjectSchema),
    defaultValues: {
      name: "",
      baseType: "page",
      description: "",
      color: "red-500",
      properties: {},
    },
    values: objectTypesMap[props.tabID],
  });
  const queryClient = useQueryClient();
  const { removeTab } = useTabsState();
  const createObjectType = useCreateObjectType(props.tabID);
  const { data: ids, isPending } = useAllObjectTypesIDs();
  const allObjectTypesQueries = useAllObjectTypes(ids ?? []);
  const [properties, setProperties] = useState<ObjectPropertyMap>({});

  useEffect(() => {
    const { unsubscribe } = form.watch((value) => {
      const actualValue = value as ObjectType;
      updateObjectType({
        ...actualValue,
        id: props.tabID,
      });
    });
    return () => {
      unsubscribe();
    };
  }, [form.watch, updateObjectType]);
  if (!ids || isPending) return <div>Loading...</div>;
  if (!allObjectTypesQueries) return <></>;
  const isLoading = allObjectTypesQueries.some((query) => query.isLoading);
  if (isLoading) return <div>Loading...</div>;
  const allObjectTypes = allObjectTypesQueries.map((query) => query.data);

  const onSubmit = (values: z.infer<typeof CreateObjectSchema>) => {
    createObjectType({
      ...values,
      properties: properties,
    }).then(() => {
      queryClient.invalidateQueries({
        queryKey: [ALL_OBJECT_TYPE_QUERY_KEY],
      });
      removeTab(props.tabID);
    });
  };
  const addProperty = (key: string, prop: ObjectProperty) => {
    setProperties((prev) => {
      return produce(prev, (draft) => {
        draft[key] = prop;
      });
    });
  };

  const onPropertyTypeChange = (
    key: string,
    type: PropertyTypeEnum,
    name?: string
  ) => {
    setProperties((prev) => {
      return produce(prev, (draft) => {
        draft[key].type = type;
        const result = PropertyType.safeParse(type);
        if (!result.success) {
          draft[key].name =
            allObjectTypes.find((t) => {
              draft[key].isObjectReference = true;
              return t?.id === type;
            })?.name ?? "Unknown";
        } else {
          draft[key].defaultValue = JSON.stringify(PropertyDefaultValues[type]);
        }
      });
    });
  };

  const onPropertyRemove = (key: string) => {
    setProperties((prev) => {
      return produce(prev, (draft) => {
        delete draft[key];
      });
    });
  };

  return (
    <div className=" p-6 h-full w-full flex flex-col gap-4 bg-background items-center rounded-md shadow-md ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-[50%]"
        >
          <CardTitle>Create Object Type</CardTitle>
          <div className="gap-4 flex flex-col mt-2">
            <div className="flex flex-col gap-4">
              {/* <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="icon">Icon</FormLabel>
                      <Input {...field} placeholder="Select an icon" />
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="baseType">Name</FormLabel>
                    <Input {...field} placeholder="Enter a name" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="color">Color</FormLabel>
                    <ColorPicker
                      color={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <Textarea {...field} placeholder="Enter a description..." />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Create Object Type</Button>
          </div>
          <Separator className="my-2" />
          <p className="text-xl">Edit properties</p>
          <p className="text-sm text-muted-foreground">
            Add, remove, and customize the properties of this object type.{" "}
            <a href="#" className="text-primary hover:underline">
              Learn more
            </a>
            .
          </p>
          <div className="space-y-4 h-full py-4 overflow-y-auto max-h-[400px]">
            {Object.entries(properties).map(([key, prop], index) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PropertyTypeIcon type={prop.type} />
                  <Input
                    value={prop.name}
                    onChange={(e) => {
                      setProperties((prev) => {
                        return produce(prev, (draft) => {
                          draft[key].name = e.target.value;
                        });
                      });
                    }}
                    placeholder="Enter a name"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    onValueChange={(value) =>
                      onPropertyTypeChange(key, value as PropertyTypeEnum)
                    }
                    value={prop.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectSeparator />
                      {allObjectTypes.map((type) => {
                        if (!type) return;
                        return (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <EllipsisVertical size={14} />
                  </Button>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    onClick={(e) => {
                      e.preventDefault();
                      onPropertyRemove(key);
                    }}
                  >
                    <LucideX size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full my-2"
            onClick={(e) => {
              e.preventDefault();
              const propertyID = uuid();
              addProperty(propertyID, {
                ...DEFAULT_PROPERTY_VALUE,
                id: propertyID,
                objectTypeId: props.tabID,
              });
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add property
          </Button>
        </form>
      </Form>
    </div>
  );
}
