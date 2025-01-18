import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useSidebarState, useTabsState } from "../store/miscStore";
import CreateObjectType from "../components/blocks/CreateObjectType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { LucidePanelLeftOpen, LucidePin, LucideX } from "lucide-react";
import ObjectContent from "../components/blocks/content/object-content";
import { useQueries } from "@tanstack/react-query";
import { ObjectInstance } from "../store/objectsStore";
import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ObjectType } from "../types/objectTypes";
import ObjectDashboard from "../components/blocks/ObjectDashboard";
// import ToDoList from "../components/blocks/content/todolist/todolist";
const Content = () => {
  const { tabsState, setActiveTab, removeTab } = useTabsState();
  const activeTab = tabsState.activeTab;
  const [dialogOpen, setDialogOpen] = useState(false);
  const objectTypeQueries = useQueries({
    queries: tabsState.tabs.map((tab) => ({
      queryKey: ["objectType", tab.id],
      select: (data: ObjectType) => {
        return {
          id: data.id,
          name: data.name,
        };
      },
    })),
  });

  const objectsQueries = useQueries({
    queries: tabsState.tabs.map((tab) => ({
      queryKey: ["object", tab.id],
      select: (data: ObjectInstance) => {
        return {
          id: data.id,
          title: data.title,
        };
      },
    })),
  });
  const { setSidebarOpen, isSidebarOpen } = useSidebarState();

  const objectTitles = objectsQueries.map((query) => query.data);
  const objectTypeTitles = objectTypeQueries.map((query) => query.data);
  return (
    <div
      className="py-1"
      style={{
        height: "calc(100vh - 54px)",
      }}
    >
      <Tabs className="h-full" value={activeTab ?? ""}>
        {/* <TabsList className={"h-[4%] px-4 draggable w-full justify-start"}>
          <TabsTrigger
            value="sidebar"
            onClick={() => setSidebarOpen(true)}
            className={cn(
              "transition-all duration-100 ease-in-out",
              !isSidebarOpen
                ? "ml-12 opacity-100"
                : "ml-0 hidden pointer-events-none opacity-0"
            )}
          >
            <LucidePanelLeftOpen size={18} />
          </TabsTrigger>
        </TabsList> */}
        {tabsState.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="h-[100%]  px-4">
            {tab.type === "createObjectType" && (
              <CreateObjectType key={tab.id} tabID={tab.id} />
            )}
            {tab.type === "object" && <ObjectContent tabId={tab.id} />}
            {tab.type === "objectType" && (
              <ObjectDashboard key={tab.id} tabId={tab.id} />
            )}
            {/* {tab.type === "todoList" && <ToDoList />} */}
          </TabsContent>
        ))}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                work.
              </DialogDescription>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                  }}
                  variant={"ghost"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setDialogOpen(false);
                    if (activeTab) removeTab(activeTab);
                  }}
                  variant={"destructive"}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default Content;
