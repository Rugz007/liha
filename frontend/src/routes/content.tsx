import {
  Tabs,
  TabsContent
} from "../components/ui/tabs";
import { useTabsState } from "../store/miscStore";
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
import ObjectContent from "../components/blocks/content/object-content";
import ObjectDashboard from "../components/blocks/ObjectDashboard";
// import ToDoList from "../components/blocks/content/todolist/todolist";
const Content = () => {
  const { tabsState, removeTab } = useTabsState();
  const activeTab = tabsState.activeTab;
  const [dialogOpen, setDialogOpen] = useState(false);
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
