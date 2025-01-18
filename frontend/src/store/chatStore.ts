import { create } from "zustand";
import { SendMessage } from "../../wailsjs/go/main/App";
import { useObject } from "./objectsStore";

type MessageRole = "user" | "ai" | "reference";

type Message = {
  id: number;
  role: MessageRole;
  content: string;
  timestamp: string;
  reference?: {
    title: string;
    id: string;
  };
};

const useMessageStore = create<{
  messages: Message[];
  addMessage: (message: Message) => void;
}>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

function useSendMessage(currentObjectID: string) {
  const { messages, addMessage } = useMessageStore();
  const { refetch } = useObject(currentObjectID);
  return async (message: Message) => {
    addMessage(message);
    const response = await SendMessage(message.content, currentObjectID);
    if (response.startsWith("$TOOL_USAGE")) {
      // Refetch the current object id to get the updated object
      refetch();
    }
    addMessage({
      id: messages.length + 1,
      role: "ai",
      content: response,
      timestamp: "Just now",
    });
  };
}

export type { MessageRole, Message };
export { useMessageStore, useSendMessage };
