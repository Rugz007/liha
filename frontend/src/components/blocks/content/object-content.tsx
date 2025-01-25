import { Extensions } from "./text/text-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import {
  LucidePanelLeft,
  LucidePanelRight,
  LucidePin,
  LucidePinOff,
} from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import OptionsSidebar from "./options-siderbar";
import { Separator } from "../../ui/separator";
import { ReactFrameworkOutput } from "@remirror/react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useBackgroundColor,
  useDefaultFont,
  useObject,
} from "@/store/objectsStore";
import { useQuery } from "@tanstack/react-query";
import { ObjectType } from "@/types/objectTypes";
import { produce } from "immer";
import ContentTag from "./content-tags";
import { ImperativePanelHandle } from "react-resizable-panels";
import PropertiesSidebar from "./properties-sidebar";
import ContentGridMemo from "./content-grid";
import { Switch } from "../../ui/switch";
const ObjectContent = ({ tabId }: { tabId: string }) => {
  const {
    data: object,
    mutate,
    isError,
    isPending,
    isSuccess,
    isLoading
  } = useObject(tabId);
  const objectTypeID = object?.type;
  const { data: objectType } = useQuery<ObjectType>({
    queryKey: ["objectType", objectTypeID],
    enabled: !!objectTypeID,
  });
  const editorRef = useRef<ReactFrameworkOutput<Extensions>>(null);
  const { backgroundColor, setBackgroundColor } = useBackgroundColor(tabId);
  const { defaultFont, setDefaultFont } = useDefaultFont(tabId);
  const [freeDrag, setFreeDrag] = useState(true);

  const propertiesSidebarRef = useRef<ImperativePanelHandle>(null);
  const optionsSidebarRef = useRef<ImperativePanelHandle>(null);
  const [propertiesSidebarOpen, setPropertiesSidebarOpen] = useState(false);
  const [optionsSidebarOpen, setOptionsSidebarOpen] = useState(false);

  useEffect(() => {
    if (propertiesSidebarRef.current && propertiesSidebarOpen) {
      propertiesSidebarRef.current.expand();
    } else if (propertiesSidebarRef.current && !propertiesSidebarOpen) {
      propertiesSidebarRef.current.collapse();
    }
  }, [propertiesSidebarOpen]);

  useEffect(() => {
    if (optionsSidebarRef.current && optionsSidebarOpen) {
      optionsSidebarRef.current.expand();
    } else if (optionsSidebarRef.current && !optionsSidebarOpen) {
      optionsSidebarRef.current.collapse();
    }
  }, [optionsSidebarOpen]);
  const generatedLayout = useMemo(() => {
    if (object && object.contents) {
      return Object.entries(object.contents).map(([key, value]) => {
        const contentObj = value;
        return {
          i: key,
          x: contentObj.x,
          y: contentObj.y,
          w: contentObj.w,
          h: contentObj.h,
        };
      });
    } else {
      return [];
    }
  }, [object?.contents]);
  if (!object) return null;
  if (!objectType) return null;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div
      className={cn(
        "bg-background min-h-full h-full border rounded-md shadow-sm"
      )}
    >
      <ResizablePanelGroup direction={"horizontal"} className="h-full">
        <ResizablePanel
          defaultSize={propertiesSidebarOpen ? 20 : 0}
          collapsible
          className="h-full transition-all ease-in-out duration-100"
          collapsedSize={0}
          minSize={20}
          maxSize={30}
          ref={propertiesSidebarRef}
        >
          <PropertiesSidebar id={tabId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className={cn("overflow-y-scroll py-2 h-full")}>
          <div className="flex justify-between items-center px-4">
            <div className="flex gap-1 items-center w-[50%] mb-1">
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={() => {
                  setPropertiesSidebarOpen(!propertiesSidebarOpen);
                }}
              >
                <LucidePanelLeft size={18} />
              </Button>
              <Button
                variant={"ghost"}
                size={"iconSm"}
                className="text-muted-foreground"
                onClick={() => {
                  const newObject = produce(object, (draft) => {
                    draft.pinned = !draft.pinned;
                  });
                  mutate(newObject);
                }}
              >
                {object.pinned ? (
                  <LucidePin size={18} />
                ) : (
                  <LucidePinOff size={18} />
                )}
              </Button>
              <Input
                variant="ghost"
                placeholder="Enter Title here"
                value={object.title}
                onChange={(e) => {
                  const newObject = produce(object, (draft) => {
                    draft.title = e.target.value;
                  });
                  mutate(newObject);
                }}
              />
            </div>
            <div className="flex gap-1 items-center">
              {/* <ContentTag
                type={object.aiReady ? "AI Ready" : "Not AI Ready"}
                className="mr-2"
              /> */}
              <ContentTag
                type={
                  isError
                    ? "Error"
                    : isPending
                    ? "Saving"
                    : isSuccess
                    ? "Saved"
                    : "Loading"
                }
                className="mr-2"
              />
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={() => {
                  setOptionsSidebarOpen(!optionsSidebarOpen);
                }}
              >
                <LucidePanelRight size={18} />
              </Button>
            </div>
          </div>
          <Separator />
          <div
            className={cn(
              "h-full  overflow-y-scroll pb-10",
              backgroundColor === "" && "bg-background"
            )}
            style={{ backgroundColor: backgroundColor }}
          >
            <ContentGridMemo
              generatedLayout={generatedLayout}
              freeDrag={freeDrag}
              editorRef={editorRef}
              object={object}
              mutate={mutate}
              defaultFont={defaultFont}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={optionsSidebarOpen ? 15 : 0}
          collapsible
          className="h-full transition-all ease-in-out duration-100"
          collapsedSize={0}
          minSize={20}
          maxSize={40}
          ref={optionsSidebarRef}
        >
          <OptionsSidebar
            editorRef={editorRef}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            defaultFont={defaultFont}
            setDefaultFont={setDefaultFont}
            freeDrag={freeDrag}
            setFreeDrag={setFreeDrag}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default memo(ObjectContent);
