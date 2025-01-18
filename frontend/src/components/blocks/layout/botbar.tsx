import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Bot, LucideLightbulb, LucidePanelRightClose } from "lucide-react";
import { Button } from "../../ui/button";
import { useBotSidebarState } from "../../../store/miscStore";
import { Separator } from "../../ui/separator";
import Chat from "../chat/chat";

const Botbar = () => {
  const { setBotSidebarOpen, isBotSidebarOpen } = useBotSidebarState();
  return (
    <div className="h-screen">
      <Tabs defaultValue="bot" className="h-full">
        <TabsList className="w-full h-[42px]  shadow-inner relative rounded-none">
          <Button
            variant={"invisible"}
            className="absolute left-0 border-r rounded-none"
            onClick={() => {
              setBotSidebarOpen(false);
            }}
          >
            <LucidePanelRightClose size={18} />
          </Button>
          <TabsTrigger value="bot">
            <Bot size={18} />
          </TabsTrigger>
          <TabsTrigger value="idea">
            <LucideLightbulb size={18} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bot" asChild><Chat /></TabsContent>
        <TabsContent value="idea">Idea</TabsContent>
      </Tabs>
    </div>
  );
};

export default Botbar;
