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
import { useTabsState } from "../../store/layoutStore";
const CreateObjectSchema = ObjectTypeSchema.omit({ id: true });

const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) => {
  const colors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-gray-500",
  ];

  return (
    <div className="flex space-x-2 mt-2">
      {colors.map((bgColor) => (
        <button
          key={bgColor}
          className={`w-6 h-6 rounded-full ${bgColor} transition-all duration-200 ease-in-out ${
            color === bgColor ? "ring-2 ring-offset-2 ring-gray-400" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            onChange(bgColor);
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
      icon: "",
      baseType: "page",
      description: "",
      color: "",
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
              return t?.id === type;
            })?.name ?? "Unknown";
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
    <div className="w-full  p-6 h-full space-y-4 bg-background rounded-md shadow-md ">
      <div className="max-w-3xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardTitle>Create Object Type</CardTitle>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="icon">Icon</FormLabel>
                      <Input {...field} placeholder="Select an icon" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      <Textarea
                        {...field}
                        placeholder="Enter a description..."
                      />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Create Object Type</Button>
            </div>
            <Separator className="my-2" />
            <CardTitle>Edit properties</CardTitle>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add, remove, and customize the properties of this object type.{" "}
                <a href="#" className="text-primary hover:underline">
                  Learn more
                </a>
                .
              </p>
              {Object.entries(properties).map(([key, prop], index) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {prop.icon} {prop.name}
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
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  addProperty(uuid(), {
                    ...DEFAULT_PROPERTY_VALUE,
                  });
                }}
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Add property
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}