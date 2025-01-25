import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  FontFamilyExtension,
  PositionerExtension,
  UnderlineExtension,
} from "remirror/extensions";
import {
  ReactExtensions,
  ReactFrameworkOutput,
  Remirror,
  useHelpers,
  useRemirror,
  useRemirrorContext,
} from "@remirror/react";
import "remirror/styles/all.css";
import "../../../../remirror.css";
import { forwardRef, memo, useCallback, useImperativeHandle } from "react";
import debounce from "lodash/debounce";
import { ThemeProvider } from "@remirror/react";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";
import { FloatingToolbar } from "./floating-toolbar";
import { DecorationsExtension } from "remirror";
import { motion } from "framer-motion";
import { TextColorExtension } from 'remirror/extensions';


// import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';
const extensions = () => [
  new PlaceholderExtension({
    placeholder: "Type here...",
    // emptyNodeClass: "my-custom-placeholder",
  }),
  new BoldExtension({}),
  new ItalicExtension(),
  // new CalloutExtension({ defaultType: "warn" }), // Override defaultType: 'info'
  // new LinkExtension({ autoLink: true }),

  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension({}),
  new BlockquoteExtension(),
  new BulletListExtension({}),
  new OrderedListExtension(),
  // new ListItemExtension({
  //   priority: ExtensionPriority.High,
  //   enableCollapsible: true,
  // }),
  new CodeExtension(),
  new MarkdownExtension({}),
  new HardBreakExtension(),
  new FontFamilyExtension({}),
  new PositionerExtension({}),
  new UnderlineExtension(),
  new DecorationsExtension({}),
  new TextColorExtension({}),
];

export type Extensions = ReactExtensions<
  | PlaceholderExtension
  | BoldExtension
  | ItalicExtension
  | StrikeExtension
  | HeadingExtension
  | BlockquoteExtension
  | BulletListExtension
  | OrderedListExtension
  | CodeExtension
  | HardBreakExtension
  | FontFamilyExtension
  | PositionerExtension
  | UnderlineExtension
  | MarkdownExtension
  | DecorationsExtension
  | TextColorExtension
>;
interface TextEditorProps {
  mutate: (newState: string) => void;
  content: string;
  defaultFont: string;
  freeDrag: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const EditorComponent = ({
  onBlur,
  onFocus,
}: {
  onFocus: () => void;
  onBlur: () => void;
}) => {
  const { getText } = useHelpers();
  const text = getText();

  return (
    <motion.div
      {...useRemirrorContext().getRootProps()}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full h-8 bg-gradient-to-b from-background to-transparent "
      // animate={{
      //   opacity: [0, 1, 0],
      // }}
      // transition={{
      //   duration: 4,
      //   repeat: Infinity,
      //   ease: "easeInOut",
      // }}
    />
  );
};

const TextEditor = forwardRef<
  ReactFrameworkOutput<Extensions>,
  TextEditorProps
>(({ mutate, content, defaultFont, freeDrag, onFocus, onBlur }, ref) => {
  const { manager, state, setState, getContext } = useRemirror({
    extensions: extensions,
    content: content,
    stringHandler: "markdown",
  });
  const debouceFn = useCallback(
    debounce((newState: string) => {
      mutate(newState);
    }, 300),
    [mutate]
  );
  //@ts-expect-error - This is a hack to get the context
  useImperativeHandle(ref, () => getContext(), [getContext]);

  return (
    <div
      className={cn(
        "h-full rounded-lg bg-background border border-transparent ",
        freeDrag && "border-border/40 hover:border-border"
      )}
    >
      <div className="h-full overflow-y-scroll">
        <div className="remirror-theme cursor-text">
          <ThemeProvider
            theme={{
              fontFamily: {
                default: defaultFont,
              },
            }}
          >
            <Remirror
              manager={manager}
              onChange={({ helpers, state }) => {
                const markdown = helpers.getMarkdown(state);
                debouceFn(markdown);
                setState(state);
              }}
              state={state}
            >
              <EditorComponent onFocus={onFocus} onBlur={onBlur} />
              <FloatingToolbar />
            </Remirror>
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
});

export default memo(TextEditor);
