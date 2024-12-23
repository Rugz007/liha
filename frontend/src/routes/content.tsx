import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useSidebarState, useTabsState } from "../store/layoutStore";
import CreateObjectType from "../components/blocks/CreateObjectType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { LucidePanelLeftOpen, LucidePin, LucideX } from "lucide-react";
import ObjectContent from "../components/blocks/content/object-content";
import { useQueries } from "@tanstack/react-query";
import { ObjectInstance } from "../store/objectsStore";
import { cn } from "../lib/utils";
// import ToDoList from "../components/blocks/content/todolist/todolist";
const Content = () => {
  const { tabsState, setActiveTab, removeTab } = useTabsState();
  const activeTab = tabsState.activeTab;
  const [dialogOpen, setDialogOpen] = useState(false);
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
  return (
    <div
      className="py-1"
      style={{
        height: "calc(100vh - 42px)",
      }}
    >
      <Tabs className="h-full" value={activeTab ?? ""}>
        <TabsList className={"h-[4%] px-4 draggable w-full justify-start"}>
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

          {tabsState.tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => {
                if (tab.id !== activeTab) setActiveTab(tab.id);
              }}
              className="flex gap-2"
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
              ) : (
                "Untitled"
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tab.type === "createObjectType") {
                    setDialogOpen(true);
                    return;
                  }
                  removeTab(tab.id);
                }}
                variant={"invisible"}
                className="hover:text-muted-foreground h-6 w-6 p-0 hover:shadow-inner"
              >
                <LucideX size={12} />
              </Button>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabsState.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="h-[98%]  px-4">
            {tab.type === "createObjectType" && (
              <CreateObjectType key={tab.id} tabID={tab.id} />
            )}
            {tab.type === "object" && <ObjectContent tabId={tab.id} />}
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
