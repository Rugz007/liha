import { GripVertical, LucideSettings2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { ObjectInstance, ObjectContent } from "@/store/objectsStore";
import { produce } from "immer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ImageBlockProps {
  object: ObjectInstance;
  contentObject: ObjectContent;
  contentKey: string;
  mutate: (newObject: ObjectInstance) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  object,
  contentObject,
  contentKey,
  mutate,
}) => {
  const [selectedImageFitting, setSelectedImageFitting] = React.useState<
    "Fit" | "Fill" | "Stretch"
  >("Fit");
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    // # read file as a base64 encoded string

    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newObject = produce(object, (draft) => {
        if (!draft.contents) draft.contents = {};
        draft.contents[contentKey].content = imageUrl;
      });
      mutate(newObject);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="relative w-full h-full">
      <img
        src={contentObject?.content || "https://placehold.co/600x400"}
        alt="placeholder"
        className={cn(
          "w-full h-full",
          selectedImageFitting === "Fit" && "object-contain",
          selectedImageFitting === "Fill" && "object-cover",
          selectedImageFitting === "Stretch" && "object-fill"
        )}
      />
      <GripVertical
        className="drag-handle left-0 top-[50%] absolute cursor-move text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        size={20}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            size="iconSm"
          >
            <LucideSettings2 size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 flex-col">
          <p>Select Image Style</p>
          <Select
            value={selectedImageFitting}
            onValueChange={(value) => {
              setSelectedImageFitting(value as "Fit" | "Fill" | "Stretch");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Change Image" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fit">Fit</SelectItem>
              <SelectItem value="Fill">Fill</SelectItem>
              <SelectItem value="Stretch">Stretch</SelectItem>
            </SelectContent>
          </Select>
          <Separator />
          <p>Actions</p>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
            id="imageUpload"
          />
          <Button
            className="w-full"
            onClick={() => document.getElementById("imageUpload")?.click()}
          >
            Change Image
          </Button>

          <Button
            className="w-full"
            variant={"destructive"}
            onClick={() => {
              const newObject = produce(object, (draft) => {
                if (!draft.contents) draft.contents = {};
                delete draft.contents[contentKey];
              });
              mutate(newObject);
            }}
          >
            Delete
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default React.memo(ImageBlock);
