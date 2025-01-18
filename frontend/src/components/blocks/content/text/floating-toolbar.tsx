import React, {
  CSSProperties,
  FC,
  RefCallback,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { PositionerParam } from "@remirror/extension-positioner";
import { getPositioner } from "@remirror/extension-positioner";
import { usePositioner } from "@remirror/react-hooks";
import { useCommands, useRemirrorContext } from "@remirror/react";
import { Button } from "../../../ui/button";
import {
  LucideBold,
  LucideItalic,
  LucideSparkles,
  LucideUnderline,
} from "lucide-react";
import { BoldExtension } from "remirror/extensions";
const DEFAULT_MODIFIERS = [
  {
    name: "offset",
    options: {
      offset: [0, 8],
    },
  },
];

export interface FloatingToolbarProps {
  positioner?: PositionerParam;
}

const BubbleMenu = ({
  x,
  y,
  height,
  anchorEl,
  active,
}: {
  x: number;
  y: number;
  height: number;
  anchorEl: HTMLDivElement | null;
  active: boolean;
}) => {
  const { toggleBold } = useCommands<BoldExtension>();

  return (
    <>
      {active && anchorEl && (
        <div
          style={{
            position: "fixed",
            left: x + (anchorEl?.offsetParent?.scrollLeft || 0),
            top: y + height + (anchorEl?.offsetParent?.scrollTop || 0),
            zIndex: 1000,
            pointerEvents: "auto",
          }}
          className="bg-background p-1 rounded-lg shadow-md border"
        >
          <div className="flex gap-1">
            <Button variant={"ghost"} size="xs">
              <LucideSparkles size={12} className="mr-1" />
              Ask Lekha
            </Button>
            <Button
              variant={"ghost"}
              size="xs"
              onClick={(e) => {
                toggleBold();
              }}
            >
              <LucideBold size={16} />
            </Button>
            <Button variant={"ghost"} size="xs">
              <LucideItalic size={16} />
            </Button>
            <Button variant={"ghost"} size="xs">
              <LucideUnderline size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export const FloatingToolbar: FC<FloatingToolbarProps> = ({
  positioner = "selection",
  ...rest
}) => {
  const { ref, x, y, width, height, active } = usePositioner(
    () => getPositioner(positioner),
    [positioner]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const inlineStyle: CSSProperties = useMemo(
    () => ({
      position: "absolute",
      pointerEvents: "none",
      left: x,
      top: y,
      width,
      height,
    }),
    [x, y, width, height]
  );

  const combinedSelectionRefs: RefCallback<HTMLDivElement> = useCallback(
    (elem) => {
      setAnchorEl(elem);
      ref?.(elem);
    },
    [ref]
  );

  return (
    <>
      <div ref={combinedSelectionRefs} style={inlineStyle} />
      <BubbleMenu
        x={x}
        y={y}
        height={height + 10}
        anchorEl={anchorEl}
        active={active}
      />
    </>
  );
};
