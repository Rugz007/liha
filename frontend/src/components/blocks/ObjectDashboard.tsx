import React, { memo } from "react";
import { useObjectType, useUpdateObjectType } from "@/store/objectTypesStore";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { produce } from "immer";
import {
  LucideGalleryVerticalEnd,
  LucideList,
  LucidePlus,
  LucideSettings2,
  LucideWaypoints,
  LucideWrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAllObjects, useRecentObjectIDs } from "../../store/objectsStore";

interface ObjectDashboardProps {
  tabId: string;
}

const colorMap: {
  [key: string]: string;
} = {
  red: "#fef2f2",
  yellow: "#fefce8",
  green: "#f0fdf4",
  blue: "#eff6ff",
  indigo: "#eef2ff",
  purple: "#faf5ff",
  pink: "#fdf2f8",
  gray: "#f9fafb",
};

const darkerColorMap: {
  [key: string]: string;
} = {
  red: "#fca5a5",
  yellow: "#fde047",
  green: "#86efac",
  blue: "#93c5fd",
  indigo: "#a5b4fc",
  purple: "#c4b5fd",
  pink: "#f9a8d4",
  gray: "#d1d5db",
};

const ObjectDashboard: React.FC<ObjectDashboardProps> = ({ tabId }) => {
  const { data: objectType } = useObjectType(tabId);
  const mutate = useUpdateObjectType(tabId);
  const { data: recentObjectIDs } = useRecentObjectIDs(objectType?.id ?? "");
  const queries = useAllObjects(recentObjectIDs);
  // Get the recent objects
  const recentObjects = queries.map((query) => query.data).filter(Boolean);
  if (!objectType) return null;
  const color = objectType.color.split("-")[0];
  return (
    <div
      className={cn(
        "w-full h-full bg-background rounded-md shadow-md px-4 py-4 flex flex-col gap-2 allow-select"
      )}
    >
      <div className="flex w-full justify-between items-start ">
        <div className="flex flex-col gap-2">
          <Input
            className="text-4xl px-0"
            value={objectType?.name}
            onChange={(e) => {
              const newObjectType = produce(objectType, (draft) => {
                if (!draft) return;
                draft.name = e.target.value;
              });
              if (newObjectType) {
                mutate(newObjectType);
              }
            }}
            variant="ghost"
          />
          <p className="allow-select">{objectType?.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            className="rounded-full h-8 w-8 p-0"
            style={{
              boxShadow: `0 1px 6px 2px ${darkerColorMap[color]}`,
            }}
          >
            <LucidePlus size={18} />
          </Button>
          <Button variant={"outline"} className="rounded-full h-8 w-8 p-0">
            <LucideWaypoints size={18} />
          </Button>
          <Button variant={"outline"} className="rounded-full h-8 w-8 p-0">
            <LucideWrench size={18} />
          </Button>
        </div>
      </div>
      <div className="flex items-center w-full gap-2">
        <p className="shrink-0 mr-2 font-light">Recents</p>
        <Separator className="flex-1" />
        <Button variant={"ghost"} size={"iconSm"}>
          <LucideSettings2 size={14} />
        </Button>
      </div>
      <div className="flex gap-2">
        {recentObjects.map((object) => {
          if (!object) return null;
          return (
            <div
              key={object.id}
              className={cn("border rounded-md p-4 flex-1")}
              style={{
                backgroundColor: colorMap[color],
              }}
            >
              <p className="text-xl">{object.title}</p>
              <p>{object.description}</p>
              <p className="text-sm text-muted-foreground">
                {/* Last updated: {new Date(object.updatedAt).toLocaleString()} */}
              </p>
            </div>
          );
        })}
        {recentObjects.length === 0 && (
          <div className="flex-1 flex items-center justify-center">

            <p className="text-lg text-muted-foreground">
              No recent {objectType.name}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center w-full gap-2">
        <p className="flex gap-2 shrink-0 mr-2 font-light">
          {objectType?.name}
          <Badge className={cn(`bg-${objectType.color}`)}>123</Badge>
        </p>
        <Separator className="flex-1" />
        <Button variant={"ghost"} size={"iconSm"}>
          <LucideSettings2 size={14} />
        </Button>
      </div>
      <Tabs asChild defaultValue="all">
        <ResizablePanelGroup
          className="flex-1"
          direction="horizontal"
          onResize={(sizes) => {
            console.log(sizes);
          }}
        >
          <ResizablePanel
            className="bg-background py-2 px-2"
            defaultSize={30}
            maxSize={50}
            minSize={10}
            collapsible
            collapsedSize={0}
          >
            <p className="text-muted-foreground">
              {objectType?.name} Collections
            </p>
            <TabsList className="flex flex-col gap-2 h-full justify-start bg-inherit">
              <TabsTrigger
                value="all"
                className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <LucideGalleryVerticalEnd size={14} className="mr-2" />
                All {objectType?.name}
              </TabsTrigger>
              <Separator className="w-full" />
              <TabsTrigger
                value="all1"
                className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                All {objectType?.name}
              </TabsTrigger>
              <Button>New Collection</Button>
            </TabsList>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="bg-background">
            <TabsContent value="all" className="px-4">
              <Input
                variant="ghost"
                placeholder="Untitled Collection"
                className="w-[30%]"
                value={"All " + objectType.name}
              />
            </TabsContent>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Tabs>
    </div>
  );
};

export default memo(ObjectDashboard);
