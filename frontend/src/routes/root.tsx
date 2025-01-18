import React, { useEffect, useRef } from "react";
import Sidebar from "@/components/blocks/layout/sidebar";
import Header from "@/components/blocks/layout/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useBotSidebarState, useSidebarState } from "../store/miscStore";
import Content from "./content";
import Botbar from "../components/blocks/layout/botbar";

const Root = () => {
  const { setSidebarOpen, isSidebarOpen } = useSidebarState();
  const { setBotSidebarOpen, isBotSidebarOpen } = useBotSidebarState();
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const botSidebarRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      if (isSidebarOpen) {
        sidebarRef.current.expand();
      } else {
        sidebarRef.current.collapse();
      }
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (botSidebarRef.current) {
      if (isBotSidebarOpen) {
        botSidebarRef.current.expand();
      } else {
        botSidebarRef.current.collapse();
      }
    }
  }, [isBotSidebarOpen]);

  return (
    <div className=" h-[100vh] disable-select">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={isSidebarOpen ? 20 : 0}
          minSize={15}
          maxSize={25}
          collapsible
          onCollapse={() => setSidebarOpen(false)}
          onExpand={() => setSidebarOpen(true)}
          ref={sidebarRef}
          className="transition-all duration-100 ease-in-out"
        >
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="bg-muted h-full">
          <Header />
          <Content />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={isBotSidebarOpen ? 35 : 0}
          minSize={15}
          maxSize={50}
          collapsible
          onCollapse={() => setBotSidebarOpen(false)}
          onExpand={() => setBotSidebarOpen(true)}
          className="transition-all duration-100 ease-in-out"
          ref={botSidebarRef}
        >
          <Botbar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Root;
