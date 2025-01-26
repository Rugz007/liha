import React, { memo } from "react";
import { useObjectWithSelect } from "@/store/objectsStore";
import { useQuery } from "@tanstack/react-query";
import { ObjectType } from "../../../types/objectTypes";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Calendar } from "../../ui/calendar";
import { CalendarIcon, HashIcon } from "lucide-react";
import { Switch } from "../../ui/switch";
import { produce } from "immer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import ObjectSelect from "../../object-select";

interface PropertiesSidebarProps {
  id: string;
}

const PropertiesSidebar = memo(
  ({ id }: PropertiesSidebarProps): JSX.Element => {
    const { data: object, mutate } = useObjectWithSelect(id, 'properties', (object) => {
      if (!object.properties) {
        object.properties = {};
      }
      return object;
    });
    const objectTypeId = object?.type;
    const { data: objectType } = useQuery<ObjectType>({
      queryKey: ["objectType", objectTypeId],
      enabled: !!objectTypeId,
    });

    if (!object || !objectType) {
      return <div>Loading...</div>;
    }
    return (
      <div className="px-2 py-4 flex flex-col gap-2">
        {object.properties &&
          Object.entries(object.properties).map(
            ([key, property]) => {
              if (objectType.properties[key].type === "text") {
                return (
                  <div key={key}>
                    <Label>{objectType.properties[key].name}</Label>
                    <Input
                      value={property.value}
                      onChange={(e) => {
                        const draft = { ...object };
                        const newObject = produce(draft, (draft) => {
                          if (!draft.properties) {
                            draft.properties = {};
                          }
                          draft.properties[key].value = e.target.value;
                        });
                        mutate(newObject);
                      }}
                    />
                  </div>
                );
              } else if (objectType.properties[key].type === "boolean") {
                return (
                  <div key={key} className="flex flex-col gap-2 py-2">
                    <Label>{objectType.properties[key].name}</Label>
                    {/* <Checkbox checked={value === "true"} /> */}
                    <Switch />
                  </div>
                );
              } else if (objectType.properties[key].type === "number") {
                return (
                  <div key={key}>
                    <Label>{objectType.properties[key].name}</Label>
                    <div className="relative">
                      <Input
                        value={property.valueNumber}
                        type="number"
                        className="pl-10"
                        onChange={(e) => {
                          const draft = { ...object };
                          const newObject = produce(draft, (draft) => {
                            if (!draft.properties) {
                              draft.properties = {};
                            }
                            draft.properties[key].valueNumber = Number(
                              e.target.value
                            );
                          });
                          mutate(newObject);
                        }}
                      />
                      <HashIcon
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 "
                        size={12}
                      />
                    </div>
                  </div>
                );
              } else if (objectType.properties[key].type === "date") {
                return (
                  <div key={key}>
                    <Label>{objectType.properties[key].name}</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal text-muted-foreground"
                        >
                          <CalendarIcon className="mr-2" size={12} />
                          {property?.valueDate
                            ? new Date(property.valueDate).toLocaleDateString()
                            : "Pick a date"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto p-0">
                        <DropdownMenuItem className="focus:bg-primary-background hover:bg-primary-background">
                          <Calendar
                            mode="single"
                            initialFocus
                            onDayClick={(day) => {
                              const draft = { ...object };
                              const newObject = produce(draft, (draft) => {
                                if (!draft.properties) {
                                  draft.properties = {};
                                }
                                draft.properties[key].valueDate =
                                  day.toISOString();
                              });
                              mutate(newObject);
                            }}
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }
              return (
                <div key={key}>
                  <Label>{objectType.properties[key].name}</Label>
                  <ObjectSelect
                    key={key}
                    objectTypeID={objectType.properties[key].type}
                    onValueChange={(value) => {
                      if (
                        !value ||
                        value === "" ||
                        value === property.referencedObjectId
                      )
                        return;
                      const draft = { ...object };
                      const newObject = produce(draft, (draft) => {
                        if (!draft.properties) {
                          draft.properties = {};
                        }
                        draft.properties[key].referencedObjectId = value;
                      });
                      mutate(newObject);
                    }}
                    value={property.referencedObjectId ?? ""}
                  />
                </div>
              );
            }
            //   (
            //     <p>
            //       {objectType && objectType.properties[key].name}: {value} -{" "}
            //       {objectType && objectType.properties[key].type}
            //     </p>
            //   )
          )}
        {/* <Button>Add Property</Button> */}
        {!object.properties && <>No properties found</>}
      </div>
    );
  }
);

export default PropertiesSidebar;
