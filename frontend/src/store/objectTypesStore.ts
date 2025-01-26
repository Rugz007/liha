import {
  CreateObjectType,
  GetAllObjectTypeFiles,
  ReadObjectTypeFile,
} from "../../wailsjs/go/main/App";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { ObjectType, ObjectTypeSchema } from "@/types/objectTypes";
import { create } from "zustand";

const ALL_OBJECT_TYPE_QUERY_KEY = "objectTypes";
const OBJECT_TYPE_QUERY_KEY = "objectType";
function useAllObjectTypesIDs() {
  return useQuery<string[]>({
    queryKey: [ALL_OBJECT_TYPE_QUERY_KEY, "ALL"],
    queryFn: async () => {
      const result = await GetAllObjectTypeFiles();
      if (result) {
        return result;
      }
      return [];
    },
  });
}

function useAllObjectTypes(ids: string[] | undefined) {
  const objectTypeQueries = useQueries<UseQueryOptions<ObjectType>[]>({
    queries: ids
      ? ids.map((id) => ({
          queryKey: [OBJECT_TYPE_QUERY_KEY, id],
          queryFn: async () => {
            const data = await ReadObjectTypeFile(id);
            const result = ObjectTypeSchema.safeParse(JSON.parse(data));
            if (result.success) {
              return result.data;
            } else {
              throw result.error.errors;
            }
          },
          retry: 0,
          enabled: !!id,
        }))
      : [],
  });
  return objectTypeQueries;
}

function useObjectType(id: string) {
  return useQuery({
    queryKey: [OBJECT_TYPE_QUERY_KEY, id],
    queryFn: async () => {
      const data = await ReadObjectTypeFile(id);
      const result = ObjectTypeSchema.safeParse(JSON.parse(data));
      if (result.success) {
        return result.data;
      } else {
        throw result.error.errors;
      }
    },
    retry: 0,
    enabled: !!id,
  });
}

function useUpdateObjectType(id: string) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["updateObjectType", id],
    mutationFn: async (updatedObjectType: string) => {
      //TODO: Fix this
      //await UpdateObjectType(id, updatedObjectType);
    },
    onMutate: async (updatedObjectType: string) => {
      console.log("onMutate", updatedObjectType);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [ALL_OBJECT_TYPE_QUERY_KEY, "ALL"],
      });
    },
    onError: async (error) => {
      console.log("onError", error);
    },
  });
  return async (newState: ObjectType) => {
    mutate(JSON.stringify(newState));
  };
}

function useCreateObjectType(newId: string) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["createObjectType", newId],
    mutationFn: async (newObjectType: string) => {
      await CreateObjectType(newObjectType);
    },
    onMutate: async (newObjectType: string) => {
      console.log("onMutate", newObjectType);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [ALL_OBJECT_TYPE_QUERY_KEY, "ALL"],
      });
    },
    onError: async (error) => {
      console.log("onError", error);
    },
  });
  return async (newState: Omit<ObjectType, "id">) => {
    const newObjectType: ObjectType = {
      ...newState,
      id: newId,
      baseType: "page",
    };
    mutate(JSON.stringify(newObjectType));
  };
}

const useObjectTypesUnsavedStore = create<{
  objectTypesMap: Record<string, ObjectType>;
  addObjectType: (objectType: ObjectType) => void;
  updateObjectType: (objectType: ObjectType) => void;
  deleteObjectType: (objectType: ObjectType) => void;
}>((set) => ({
  objectTypesMap: {},
  addObjectType: (objectType) =>
    set((state) => ({
      objectTypesMap: {
        ...state.objectTypesMap,
        [objectType.id]: objectType,
      },
    })),
  updateObjectType: (objectType) =>
    set((state) => ({
      objectTypesMap: {
        ...state.objectTypesMap,
        [objectType.id]: objectType,
      },
    })),
  deleteObjectType: (objectType) =>
    set((state) => {
      const { [objectType.id]: _, ...rest } = state.objectTypesMap;
      return {
        objectTypesMap: rest,
      };
    }),
}));

export {
  useObjectType,
  useAllObjectTypesIDs,
  useAllObjectTypes,
  useCreateObjectType,
  useObjectTypesUnsavedStore,
  ALL_OBJECT_TYPE_QUERY_KEY,
  useUpdateObjectType
  //   useObjectTypesStore,
};
