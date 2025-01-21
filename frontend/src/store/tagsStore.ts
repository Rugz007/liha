import {
  ObjectInstanceSchema,
  useAllObjects,
  useAllObjectsIDs,
  useCreateObject,
  useObject,
} from "./objectsStore";
import { z } from "zod";
import { v4 as uuid } from "uuid";

const TAG_COLOR_UUID = "ae29371b-1de4-4d3e-98f1-7328c76f562f";
const TAG_PRIORITY_HIGH_UUID = "a1a24193-ec19-4be4-b435-2e4f6a1b610a";
const TAG_PRIORITY_MEDIUM_UUID = "b56f15f1-1148-4dd8-bc1d-1a5d9bb93c6a";
const TAG_PRIORITY_LOW_UUID = "d7bfaf5f-cd1a-490b-a76b-ffab2d5cafac";

// const TagInstanceSchema = ObjectInstanceSchema.extend({
//   properties: z.object({
//     [TAG_COLOR_UUID]: z.string(),
//   }),
// });

const TagInstanceSchema = ObjectInstanceSchema;

type TagInstance = z.infer<typeof TagInstanceSchema>;

function useAllTags() {
  const { data: objectIDs } = useAllObjectsIDs();
  if (!objectIDs) {
    return [];
  }
  const objectQueries = useAllObjects(objectIDs);
  const tags = objectQueries
    .map((query) => query.data)
    .filter(
      (tag): tag is TagInstance => tag !== undefined && tag.type === "tag"
    );
  return tags;
}

function useCreateTag() {
  const create = useCreateObject();
  return async (
    newState: Omit<
      TagInstance,
      "id" | "type" | "contents" | "pinned" | "pageCustomization" | "aiReady"
    >
  ) => {
    const newId = uuid();
    const newTag: TagInstance = {
      ...newState,
      id: newId,
      type: "tag",
      contents: {},
      pageCustomization: {
        backgroundColor: "",
        backgroundImage: "",
        defaultFont: "ui-sans-serif",
        freeDrag: false,
      },
      aiReady: false,
      pinned: false,
    };
    await create(newId, newTag);
  };
}

function useGetPrioritiesTagInstances() {
  const { data: highPriorityTagInstace } = useObject(TAG_PRIORITY_HIGH_UUID);
  const { data: mediumPriorityTagInstace } = useObject(
    TAG_PRIORITY_MEDIUM_UUID
  );
  const { data: lowPriorityTagInstace } = useObject(TAG_PRIORITY_LOW_UUID);

  if (
    !highPriorityTagInstace ||
    !mediumPriorityTagInstace ||
    !lowPriorityTagInstace
  ) {
    return null;
  } else {
    return {
      high: highPriorityTagInstace,
      medium: mediumPriorityTagInstace,
      low: lowPriorityTagInstace,
    } as {
      high: TagInstance;
      medium: TagInstance;
      low: TagInstance;
    };
  }
}

function getPriorityFromId(id: string) {
  if (id === TAG_PRIORITY_HIGH_UUID) {
    return "High";
  } else if (id === TAG_PRIORITY_MEDIUM_UUID) {
    return "Medium";
  }
  return "Low";
}

export {
  TAG_COLOR_UUID,
  TAG_PRIORITY_HIGH_UUID,
  TAG_PRIORITY_MEDIUM_UUID,
  TAG_PRIORITY_LOW_UUID,
  TagInstanceSchema,
  type TagInstance,
  useAllTags,
  useCreateTag,
  useGetPrioritiesTagInstances,
  getPriorityFromId,
};
