import React from "react";
import { Input } from "../../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { DialogClose, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { LLMProvider, useLLMSettings } from "@/store/miscStore";

const ChatSettings = () => {
  const {
    llmProvider,
    setLLMProvider,
    modelName,
    setModelName,
    serverURL,
    setServerUrl,
  } = useLLMSettings();
  return (
    <>
      <div className="flex flex-col gap-2">
        <Tabs
          value={llmProvider}
          onValueChange={(val) => setLLMProvider(val as LLMProvider)}
        >
          <TabsList>
            <TabsTrigger value="lm_studio">LM Studio</TabsTrigger>
            <TabsTrigger value="open_ai" disabled>
              Open AI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lm_studio" className="flex flex-col gap-2">
            <p className="text-sm">Models</p>
            <Input
              placeholder="Model Name here"
              defaultValue={"Llama 3.2"}
              value={modelName}
              onChange={(e) => {
                setModelName(e.target.value);
              }}
            />
            <p className="text-sm">Server URL</p>
            <Input
              placeholder="Server URL here"
              defaultValue={"http://localhost:1234"}
              value={serverURL}
              onChange={(e) => {
                setServerUrl(e.target.value);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>Close</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export default ChatSettings;
