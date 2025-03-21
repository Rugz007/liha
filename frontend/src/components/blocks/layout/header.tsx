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
import { cn } from "../../../lib/utils";
import { useFullScreen } from "../../../hooks/use-full-screen";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setBotSidebarOpen: (open: boolean) => void;
  isBotSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  setSidebarOpen,
  isSidebarOpen,
  setBotSidebarOpen,
  isBotSidebarOpen,
}) => {
  const isFullScreen = useFullScreen();
  return (
    <div className="flex relative h-[42px] border-b bg-muted draggable disable-select align-middle items-center justify-between">
      <Button
        size={"iconSm"}
        variant={"outline"}
        className={cn(
          "absolute",
          isSidebarOpen && "bg-muted",
          !isFullScreen ? "left-[80px]" : "left-[10px]",
          isSidebarOpen && 'hidden'
        )}
        onClick={() => setSidebarOpen(true)}
      >
        <LucidePanelLeftOpen size={18} />
      </Button>

      <div />
      <div className="flex gap-2 h-full items-center w-1/2">
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
