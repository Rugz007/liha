import React, { useState } from "react";
import { ObjectContent, ObjectInstance } from "../../../../store/objectsStore";
import { ReactFrameworkOutput } from "@remirror/react";
import TextEditor, { Extensions } from "./text-editor";
import { Button } from "../../../ui/button";
import { GripVertical, LucideSettings2, LucideSparkles } from "lucide-react";
import { produce } from "immer";
import { cn } from "../../../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

interface TextBlockProps {
  editorRef: React.MutableRefObject<ReactFrameworkOutput<Extensions> | null>;
  object: ObjectInstance;
  contentObject: ObjectContent;
  contentKey: string;
  defaultFont: string;
  freeDrag: boolean;
  mutate: (newObject: ObjectInstance) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({
  editorRef,
  object,
  contentObject,
  defaultFont,
  contentKey,
  freeDrag,
  mutate,
  onFocus,
  onBlur,
}) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity"
            size="iconSm"
          >
            <LucideSettings2 size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-40 text-center">
          <DropdownMenuItem className="gap-2">
            <LucideSparkles className="text-muted-foreground" size={18} />
            Summarize
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const newObject = produce(object, (draft) => {
                if (!draft.contents) draft.contents = {};
                delete draft.contents[contentKey];
              });
              mutate(newObject);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TextEditor
        mutate={(newState) => {
          const newObject = produce(object, (draft) => {
            if (!draft.contents) draft.contents = {};
            draft.contents[contentKey].content = newState;
          });
          mutate(newObject);
        }}
        freeDrag={freeDrag}
        content={contentObject.content}
        defaultFont={defaultFont}
        ref={editorRef}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <GripVertical
        className="drag-handle left-0 top-[50%] absolute cursor-move text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        size={20}
      />
    </>
  );
};

export default React.memo(TextBlock);
