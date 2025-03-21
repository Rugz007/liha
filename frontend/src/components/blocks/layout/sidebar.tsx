import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GalleryThumbnails,
  LucideCalendar,
  LucideCuboid,
  LucideEllipsis,
  LucideHome,
  LucideInbox,
  LucideLayers2,
  LucideListTodo,
  LucidePanelLeftClose,
  LucidePin,
  LucidePlus,
  LucideTablets,
  LucideX,
} from "lucide-react";

import { Button } from "../../ui/button";
import { DEFAULT_INBOX_TAB_ID, useTabsState } from "@/store/miscStore";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import { Separator } from "../../ui/separator";
import {
  useAllObjectTypes,
  useAllObjectTypesIDs,
  useObjectTypesUnsavedStore,
} from "@/store/objectTypesStore";
import { ModeToggle } from "../../ui/theme-toggle";
import {
  DEFAULT_OBJECT,
  ObjectInstance,
  useAllObjectsIDs,
  useAllObjectsWithSelect,
  useCreateObject,
} from "@/store/objectsStore";
import { ObjectType } from "@/types/objectTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { COLLECTIONS_FLAG, FEATURE_TASKS } from "../../../lib/feature-flags";
const colorMap: {
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

const Sidebar = ({
  setSidebarOpen,
}: {
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { createTab, tabsState, removeTab, setActiveTab } = useTabsState();
  const { addObjectType } = useObjectTypesUnsavedStore();
  const { data: ids } = useAllObjectTypesIDs();
  const allObjectTypesQueries = useAllObjectTypes(ids);
  const allObjectTypes = allObjectTypesQueries.map(
    (query) => query.data
  ) as ObjectType[];

  const { data: objectIDs } = useAllObjectsIDs();
  const allObjectQueries = useAllObjectsWithSelect(
    objectIDs,
    (object) => {
      return {
        id: object.id,
        title: object.title,
        type: object.type,
        pinned: object.pinned,
      } as ObjectInstance;
    },
    "sidebar"
  );
  const allObjects = allObjectQueries.map(
    (query) => query.data
  ) as ObjectInstance[];

  const pinnedObjects = useMemo(
    () => allObjects.filter((object) => object?.pinned),
    [allObjects]
  );

  const createObject = useCreateObject();
  const objectTypeQueries = useQueries({
    queries: tabsState.tabs
      .filter((tab) => tab.type === "objectType")
      .map((tab) => ({
        queryKey: ["objectType", tab.id],
        select: (data: ObjectType) => {
          return {
            id: data.id,
            name: data.name,
            color: data.color,
          };
        },
      })),
  });

  const objectTypeTitles = objectTypeQueries.map((query) => query.data);

  const objectsQueries = useAllObjectsWithSelect(
    tabsState.tabs.filter((tab) => tab.type === "object").map((tab) => tab.id),
    (object) => {
      return {
        id: object.id,
        title: object.title,
      } as ObjectInstance;
    },
    "tabs"
  );
  const objectTitles = objectsQueries.map((query) => query.data);

  const handleCreateTab = () => {
    const tabId = uuid();
    addObjectType({
      id: tabId,
      name: "",
      baseType: "page",
      description: "",
      color: "red-500",
      properties: {},
      fixed: false,
    });
    createTab(tabId, "createObjectType");
  };
  const activeTab = tabsState.activeTab;

  const handleCreateObject = (objectType: ObjectType) => {
    if (!objectType) return;
    const tabId = uuid();
    const contentUUID = uuid();
    createObject(tabId, {
      ...DEFAULT_OBJECT,
      type: objectType?.id ?? "",
      contents: {
        [contentUUID]: {
          type: "text",
          content: "",
          id: contentUUID,
          x: 0,
          y: 0,
          w: 12,
          h: 12,
        },
      },
    }).then(() => {
      createTab(tabId, "object");
    });
  };

  const getColor = (tabId: string) => {
    const tab = tabsState.tabs.find((tab) => tab.id === tabId);
    if (!tab) return "";
    if (tab.type === "objectType") {
      return colorMap[
        objectTypeTitles
          .find((objectType) => objectType?.id === tabId)
          ?.color?.split("-")[0] ?? "gray"
      ];
    } else if (tab.type === "object") {
      return colorMap[
        allObjectTypes
          .find(
            (objectType) =>
              objectType?.id ===
              allObjects.find((obj) => obj?.id === tabId)?.type
          )
          ?.color?.split("-")[0] ?? "gray"
      ];
    } else {
      return "";
    }
  };

  const getColorFromObject = (objectTypeId: string) => {
    return colorMap[
      allObjectTypes
        .find((objectType) => objectType?.id === objectTypeId)
        ?.color?.split("-")[0] ?? "gray"
    ];
  };

  return (
    <div className="h-full flex flex-col gap-4 px-3 py-2 disable-select bg-muted border-r border-border">
      <div className="flex h-[22px] justify-between draggable">
        <div />
        <Button
          size={"iconSm"}
          variant={"ghost"}
          onClick={() => setSidebarOpen(false)}
        >
          <LucidePanelLeftClose size={18} />
        </Button>
      </div>

      <div className="flex flex-row gap-2">
        <Button
          variant={"ghost"}
          className={cn("justify-center px-2 gap-2 w-full bg-secondary/50")}
          size={"sm"}
          onClick={() => {
            createTab(DEFAULT_INBOX_TAB_ID, "inbox");
          }}
        >
          <LucideHome size={16} />
        </Button>
        {FEATURE_TASKS && (
          <>
            <Button
              variant={"ghost"}
              className={cn("justify-center px-2 gap-2 w-full bg-secondary/50")}
              size={"sm"}
              onClick={() => {
                createTab(DEFAULT_INBOX_TAB_ID, "inbox");
              }}
            >
              <LucideListTodo size={16} />
            </Button>
            <Button
              variant={"ghost"}
              className={cn("justify-center px-2 gap-2 w-full bg-secondary/50")}
              size={"sm"}
              disabled
            >
              <LucideCalendar size={16} />
            </Button>
          </>
        )}
      </div>
      {/* <Separator /> */}
      <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
        <LucidePin size={15} /> Pinned Tabs
      </div>
      <div className="w-full ">
        <Tabs className="h-full" value={tabsState.activeTab ?? ""}>
          <TabsList
            className={
              "h-[4%] px-2 draggable w-full justify-start flex flex-col"
            }
          >
            <>
              {pinnedObjects.map((object) => (
                <TabsTrigger
                  key={object.id}
                  value={object.id}
                  onClick={() => {
                    // Check if object id is in tab state
                    if (tabsState.tabs.find((tab) => tab.id === object.id)) {
                      if (object.id !== activeTab) setActiveTab(object.id);
                    } else {
                      createTab(object.id, "object");
                    }
                  }}
                  className={cn(
                    "flex gap-2 w-full justify-between items-center group rounded-lg"
                  )}
                  style={{
                    boxShadow:
                      object.id === activeTab
                        ? `0 1px 6px 2px ${getColor(object.id)}88`
                        : undefined,
                  }}
                >
                  <motion.div
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={"flex gap-2 w-full justify-between items-center"}
                  >
                    {object.title || "Untitled"}
                    {/* <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // if (tab.type === "createObjectType") {
                        //   setDialogOpen(true);
                        //   return;
                        // }
                        removeTab(object.id);
                      }}
                      variant={"invisible"}
                      className="hover:text-muted-foreground opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:shadow-inner transition-opacity ease-linear duration-100"
                    >
                      <LucideX size={12} />
                    </Button> */}
                  </motion.div>
                </TabsTrigger>
              ))}
              {pinnedObjects.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  No pinned tabs
                </div>
              )}
            </>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full flex flex-col gap-2 ">
        <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <LucideLayers2 size={15} /> Opened Tabs
        </div>
        <Tabs className="h-full" value={tabsState.activeTab ?? ""}>
          <TabsList
            className={
              "h-[4%] px-2 draggable w-full justify-start flex flex-col  "
            }
          >
            <>
              {tabsState.tabs.map((tab) => {
                if (
                  tab.type === "object" &&
                  pinnedObjects.find((object) => object.id === tab.id)
                ) {
                  return null;
                }
                return (
                  <TabsTrigger
                    asChild
                    key={tab.id}
                    value={tab.id}
                    onClick={() => {
                      if (tab.id !== activeTab) setActiveTab(tab.id);
                    }}
                    className={cn(
                      "flex gap-2 w-full justify-between items-center group rounded-lg"
                    )}
                    style={{
                      // Add box shadow color here
                      boxShadow:
                        tab.id === activeTab
                          ? tab.type === "objectType"
                            ? `0 1px 6px 2px ${getColor(tab.id)}88`
                            : tab.type === "object"
                            ? `0 1px 6px 2px ${getColor(tab.id)}88`
                            : undefined
                          : undefined,
                    }}
                  >
                    <motion.div
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={
                        "flex gap-2 w-full justify-between items-center"
                      }
                    >
                      {tab.type === "createObjectType" ? (
                        "Create Object Type"
                      ) : tab.type === "object" ? (
                        <>
                          {objectTitles.find((object) => object?.id === tab.id)
                            ?.title || "Untitled"}
                        </>
                      ) : tab.type === "todoList" ? (
                        "To do List"
                      ) : tab.type === "inbox" ? (
                        "Inbox"
                      ) : tab.type === "objectType" ? (
                        <>
                          {objectTypeTitles.find(
                            (objectType) => objectType?.id === tab.id
                          )?.name || "Untitled"}{" "}
                          Overview
                        </>
                      ) : (
                        "Untitled"
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          // if (tab.type === "createObjectType") {
                          //   setDialogOpen(true);
                          //   return;
                          // }
                          removeTab(tab.id);
                        }}
                        variant={"invisible"}
                        className="hover:text-muted-foreground opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:shadow-inner transition-opacity ease-linear duration-100"
                      >
                        <LucideX size={12} />
                      </Button>
                    </motion.div>
                  </TabsTrigger>
                );
              })}
              {tabsState.tabs.length === 0 && (
                <div className="text-muted-foreground text-sm">
                  No open tabs
                </div>
              )}
            </>
          </TabsList>
        </Tabs>
      </div>
      <Separator />
      <div className="flex flex-col px-2 ">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex gap-2 items-center">
            <LucideCuboid size={15} /> Objects
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <LucideEllipsis size={15} className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateTab}>
                Create new object type
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Accordion type="multiple">
          {allObjectTypes &&
            allObjectTypes.map((objectType) => {
              if (objectType?.baseType !== "page") return null;
              return (
                <AccordionItem
                  value={objectType.id}
                  className="text-sm"
                  hideBorder
                  key={objectType.id}
                >
                  <AccordionTrigger hideUnderline className="pb-1 w-full">
                    <div className="flex items-center justify-between w-full group ">
                      <div
                        className="flex gap-2 items-center hover:bg-secondary hover:shadow-inner hover:rounded-md w-[90%] py-0.5 px-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (COLLECTIONS_FLAG) {
                            createTab(objectType.id, "objectType");
                          }
                        }}
                      >
                        <div
                          className={cn("w-3 h-3 rounded-full ml-0.5")}
                          style={{
                            backgroundColor: getColorFromObject(objectType.id),
                          }}
                        />
                        <p>{objectType?.name}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="group-hover:opacity-60 opacity-0 cursor-pointer">
                            <LucideEllipsis size={15} />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateObject(objectType);
                            }}
                          >
                            Create new {objectType?.name}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-l pb-0 ml-2">
                    <div className="flex flex-col gap-1">
                      {allObjects &&
                        allObjects.map((object) => {
                          if (!object) return null;
                          if (
                            object.type === objectType?.id &&
                            objectType?.baseType === "page"
                          ) {
                            return (
                              <div
                                key={object.id}
                                className={cn(
                                  "ml-3 cursor-pointer hover:bg-secondary p-1 px-2 rounded-sm transition-colors ease-in-out duration-150 group flex justify-between items-center",
                                  tabsState.activeTab === object.id &&
                                    "bg-secondary shadow-inner rounded-md"
                                )}
                                onClick={() => {
                                  createTab(object.id, "object");
                                }}
                              >
                                <p className="w-full text-ellipsis whitespace-nowrap overflow-x-clip">
                                  {object.title || "Untitled"}
                                </p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div className="group-hover:opacity-100 opacity-0">
                                      <LucideEllipsis size={15} />
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Open</DropdownMenuItem>
                                    <DropdownMenuItem>Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          } else {
                            return null;
                          }
                        })}
                      {allObjects &&
                        allObjects.filter(
                          (object) => object?.type === objectType?.id
                        ).length === 0 && (
                          <div className="ml-4 text-muted-foreground">
                            No objects
                          </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          {!allObjectTypes ||
            (allObjectTypes.length === 0 && (
              <div className="text-muted-foreground text-sm">
                No object types
              </div>
            ))}
        </Accordion>
      </div>

      <ModeToggle />
    </div>
  );
};

export default Sidebar;
