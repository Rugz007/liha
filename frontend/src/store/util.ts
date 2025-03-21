import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function useQueryWrapper<T>({
  queryKey,
  queryFn,
  mutateFn,
  editFn,
  onMutationSuccess,
}: {
  queryKey: string[];
  queryFn: () => Promise<T>;
  mutateFn: (data: T) => Promise<void>;
  editFn: (old: T, newState: T) => T;
  onMutationSuccess?: () => void;
}): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: (newState: T) => void;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
  refetch: () => void;
} {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: queryFn,
    staleTime: Infinity,
  });
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (newState: T) => {
      if (!data) {
        return Promise.resolve();
      }
      if (JSON.stringify(data) !== JSON.stringify(newState)) {
        return mutateFn(newState);
      }
      return Promise.resolve();
    },
    mutationKey: ["mutate", queryKey],
    onMutate: async (newState: T) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: T) => {
        editFn(old, newState);
      });
      return { previousData };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      console.error(err);
    },
    onSettled: () => {
      if (onMutationSuccess !== undefined) {
        console.log("Calling onMutationSuccess");
        onMutationSuccess();
      }
      queryClient.invalidateQueries({
        queryKey,
      });
    },
    onSuccess: () => {},
  });
  if (error) {
    console.error(error);
  }
  return {
    data,
    isLoading,
    error,
    mutate,
    isError,
    isPending,
    isSuccess,
    refetch,
  };
}

export { useQueryWrapper };
