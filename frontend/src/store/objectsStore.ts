import { z } from "zod";
import {
  CreateObject,
  GetAllObjects,
  GetObject,
  UpdateObject,
  GetRecentObjectsofType,
} from "../../wailsjs/go/main/App";
import { useQueryWrapper } from "./util";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { produce } from "immer";

const ContentTypes = z.enum(["text", "image", "file", "drawing", "bookmark"]);

const ContentTypeSchema = z.object({
  type: ContentTypes,
  content: z.any(),
  id: z.string().uuid(),
  x: z.number().default(0),
  y: z.number().default(0),
  w: z.number().default(0),
  h: z.number().default(0),
});
type ObjectContent = z.infer<typeof ContentTypeSchema>;

const PropertyValueSchema = z.object({
  id: z.string().uuid(),
  objectId: z.string().uuid(),
  value: z.string().optional(),
  valueBoolean: z.boolean().optional(),
  valueNumber: z.number().optional(),
  valueDate: z.string().optional(),
  referencedObjectId: z.string().optional(),
});

const PropertyValueMapSchema = z.record(PropertyValueSchema);

const ObjectInstanceSchema = z.strictObject({
  id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  contents: z.record(ContentTypeSchema).optional(),
  properties: PropertyValueMapSchema.optional(),
  aiReady: z.boolean().default(false).optional(),
  pageCustomization: z.object({
    backgroundColor: z.string().default(""),
    backgroundImage: z.string().default(""),
    defaultFont: z.string().default("ui-sans-serif"),
    freeDrag: z.boolean().default(false),
  }),
  pinned: z.boolean().default(false),
});

type ObjectInstance = z.infer<typeof ObjectInstanceSchema>;

const DEFAULT_OBJECT: ObjectInstance = {
  id: "",
  type: "",
  title: "Untitled",
  description: "",
  contents: {},
  properties: {},
  aiReady: false,
  pageCustomization: {
    backgroundColor: "",
    backgroundImage: "",
    defaultFont: "ui-sans-serif",
    freeDrag: false,
  },
  pinned: false,
};

function useCreateObject() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (newObject: string) => {
      await CreateObject(newObject);
    },
    mutationKey: ["createObject"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["objects", "ALL"],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return async (newId: string, newState: Omit<ObjectInstance, "id">) => {
    const newObject: ObjectInstance = {
      ...newState,
      id: newId,
    };
    mutate(JSON.stringify(newObject));
  };
}

function useAllObjectsIDs() {
  return useQuery<string[]>({
    queryKey: ["objects", "ALL"],
    queryFn: async () => {
      const result = await GetAllObjects();
      if (result) {
        return result;
      }
      return [];
    },
  });
}

function useRecentObjectIDs(objectType: string) {
  return useQuery<string[]>({
    queryKey: ["objects", objectType, "recent"],
    queryFn: async () => {
      const result = await GetRecentObjectsofType(objectType);
      if (result) {
        return result;
      }
      return [];
    },
  });
}

function useAllObjects(ids: string[] | undefined) {
  const objectQueries = useQueries<UseQueryOptions<ObjectInstance>[]>({
    queries: ids
      ? ids.map((id) => ({
          queryKey: ["object", id],
          queryFn: async () => {
            const data = await GetObject(id);
            const result = ObjectInstanceSchema.safeParse(JSON.parse(data));
            if (result.success) {
              return result.data;
            } else {
              console.error(result.error.errors);
              throw result.error.errors;
            }
          },
          retry: 0,
          enabled: !!id,
        }))
      : [],
  });
  return objectQueries;
}

function useAllObjectsWithSelect(
  ids: string[] | undefined,
  select: (data: ObjectInstance) => ObjectInstance,
  selectionKey: string
) {
  const objectQueries = useQueries<UseQueryOptions<ObjectInstance>[]>({
    queries: ids
      ? ids.map((id) => ({
          queryKey: ["object", selectionKey, id],
          queryFn: async () => {
            const data = await GetObject(id);
            const result = ObjectInstanceSchema.safeParse(JSON.parse(data));
            if (result.success) {
              return select(result.data);
            } else {
              console.error(result.error.errors);
              throw result.error.errors;
            }
          },
          retry: 0,
          enabled: !!id,
          select: select,
        }))
      : [],
  });
  return objectQueries;
}

function useObjectsOfType(type: string) {
  const { data: allObjectIDs } = useAllObjectsIDs();
  const allObjectsQueries = useAllObjects(allObjectIDs);
  const allObjects = allObjectsQueries.map((query) => query.data);
  const filteredObjects = allObjects.filter(
    (object) => object && object.type === type
  );
  return filteredObjects as ObjectInstance[];
}
``;
function useObject(id: string) {
  const queryClient = useQueryClient();
  return useQueryWrapper<ObjectInstance>({
    queryKey: ["object", id],
    queryFn: async () => {
      const data = await GetObject(id);
      const result = ObjectInstanceSchema.safeParse(JSON.parse(data));
      if (result.success) {
        return result.data;
      } else {
        console.error(result.error.errors);
        throw result.error.errors;
      }
    },
    editFn: (old: ObjectInstance, newState: ObjectInstance) => {
      if (JSON.stringify(old) === JSON.stringify(newState)) {
        return old;
      }
      return { ...old, ...newState };
    },
    mutateFn: async (newState: ObjectInstance) => {
      return UpdateObject(JSON.stringify(newState));
    },
    onMutationSuccess: () => {
      console.log("Mutation success");
      queryClient.invalidateQueries({
        queryKey: ["object", "sidebar", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["object", "tabs", id],
      });
    },
  });
}

function useObjectWithSelect(
  id: string,
  selectionKey: string,
  select: (data: ObjectInstance) => ObjectInstance
) {
  return useQueryWrapper<ObjectInstance>({
    queryKey: ["object", selectionKey, id],
    queryFn: async () => {
      return select(JSON.parse(await GetObject(id)));
    },
    editFn: (old: ObjectInstance, newState: ObjectInstance) => {
      if (JSON.stringify(old) === JSON.stringify(newState)) {
        return old;
      }
      return { ...old, ...newState };
    },
    mutateFn: (newState: ObjectInstance) => {
      return UpdateObject(JSON.stringify(newState));
    },
  });
}

function useDeleteObject() {
  // const queryClient = useQueryClient();
  // return async (id: string) => {
  //   await DeleteObjectFile(id);
  //   queryClient.invalidateQueries({
  //     queryKey:  ["object", id],
  //   });
  // };
}

function useDefaultFont(id: string) {
  const { data, mutate } = useObject(id);
  const setDefaultFont = (font: string) => {
    if (!data) {
      return;
    }
    const newData = produce(data, (draft) => {
      draft.pageCustomization.defaultFont = font;
    });
    mutate(newData);
  };
  return {
    defaultFont: data?.pageCustomization?.defaultFont ?? "ui-sans-serif",
    setDefaultFont,
  };
}

function useBackgroundColor(id: string) {
  const { data, mutate } = useObject(id);
  const setBackgroundColor = (color: string) => {
    if (!data) {
      return;
    }
    const newData = produce(data, (draft) => {
      draft.pageCustomization.backgroundColor = color;
    });
    mutate(newData);
  };
  return {
    backgroundColor: data?.pageCustomization?.backgroundColor ?? "",
    setBackgroundColor,
  };
}

export type { ObjectInstance, ObjectContent };
export {
  ObjectInstanceSchema,
  ContentTypes,
  useCreateObject,
  useObject,
  useAllObjects,
  useAllObjectsIDs,
  useDeleteObject,
  useDefaultFont,
  useBackgroundColor,
  useObjectsOfType,
  useRecentObjectIDs,
  useAllObjectsWithSelect,
  useObjectWithSelect,
  DEFAULT_OBJECT,
};
