import React, { useEffect, useRef } from "react";
import Sidebar from "@/components/blocks/layout/sidebar";
import Header from "@/components/blocks/layout/header";
import { ImperativePanelHandle } from "react-resizable-panels";
import Content from "./content";
import Botbar from "../components/blocks/layout/botbar";
import { Allotment, LayoutPriority } from "allotment";
import "allotment/dist/style.css";
import { FEATURE_AI_TOOLS } from "../lib/feature-flags";

const MIN_SIDEBAR_SIZE = 200;
const MAX_SIDEBAR_SIZE = 450;
const MIN_BOTBAR_SIZE = 200;
const MAX_BOTBAR_SIZE = 450;

const Root = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isBotSidebarOpen, setBotSidebarOpen] = React.useState(true);
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
      <Allotment
        defaultSizes={
          FEATURE_AI_TOOLS
            ? [isSidebarOpen ? 20 : 0, 60, isBotSidebarOpen ? 35 : 0]
            : [isSidebarOpen ? 20 : 0, 80]
        }
        vertical={false}
        snap
        proportionalLayout
        onChange={(sizes) => {
          if (sizes[0] < MIN_SIDEBAR_SIZE) {
            setSidebarOpen(false);
          } else if (sizes[0] >= MIN_SIDEBAR_SIZE) {
            setSidebarOpen(true);
          }
          if (sizes[2] < MIN_BOTBAR_SIZE) {
            setBotSidebarOpen(false);
          } else if (sizes[2] >= MIN_BOTBAR_SIZE) {
            setBotSidebarOpen(true);
          }
        }}
      >
        <Allotment.Pane
          minSize={MIN_SIDEBAR_SIZE}
          maxSize={MAX_SIDEBAR_SIZE}
          priority={LayoutPriority.Low}
          visible={isSidebarOpen}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </Allotment.Pane>
        <Allotment.Pane priority={LayoutPriority.High} snap={false}>
          <Header
            setBotSidebarOpen={setBotSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isBotSidebarOpen={isBotSidebarOpen}
            isSidebarOpen={isSidebarOpen}
          />
          <Content />
        </Allotment.Pane>
        {FEATURE_AI_TOOLS && (
          <Allotment.Pane
            minSize={MIN_BOTBAR_SIZE}
            maxSize={MAX_BOTBAR_SIZE}
            priority={LayoutPriority.Low}
            visible={isBotSidebarOpen}
          >
            <Botbar />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
};

export default Root;
