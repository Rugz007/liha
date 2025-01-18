import {
  Bot,
  LucidePanelLeftClose,
  LucidePanelLeftOpen,
  LucideSearch,
  LucideSettings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBotSidebarState, useSidebarState } from "@/store/miscStore";

const Header = () => {
  const { setSidebarOpen, isSidebarOpen } = useSidebarState();
  const { setBotSidebarOpen, isBotSidebarOpen } = useBotSidebarState();
  return (
    <div className="flex h-[42px] border-b bg-muted draggable disable-select pl-[100px] pr-[10px] align-middle items-center justify-between">
      {/* TODO: Add fullscreen position check */}
      {!isSidebarOpen ? (
        <Button
          size={"iconSm"}
          variant={"outline"}
          className={isSidebarOpen ? "bg-muted" : ""}
          onClick={() => setSidebarOpen(true)}
        >
          <LucidePanelLeftOpen size={18} />
        </Button>
      ) : (
        <div />
      )}
      <div className="flex gap-2 h-full w-1/2 mt-2">
        <Input
          placeholder="Search through your workspace"
          className="h-8 w-full"
        />
        <Button size={"iconSm"} variant={"outline"}>
          <LucideSearch size={18} />
        </Button>
      </div>
      {!isBotSidebarOpen ? (
        <Button
          size={"iconSm"}
          variant={"outline"}
          onClick={() => {
            setBotSidebarOpen(true);
          }}
        >
          <Bot size={18} />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
};

export default Header;
