import { useMutation, useQuery } from "@tanstack/react-query";

import {
  cancelTask,
  deleteTask,
  getTaskById,
  getTaskByIdAndFormat,
  getTasks,
  getTextFile,
} from "@app/api/rest";
import { universalComparator } from "@app/utils/utils";

interface FetchTasksFilters {
  addon?: string;
}

export const TasksQueryKey = "tasks";

export const useFetchTasks = (
  filters: FetchTasksFilters = {},
  refetchDisabled: boolean = false
) => {
  const { isLoading, error, refetch, data } = useQuery({
    queryKey: [TasksQueryKey],
    queryFn: getTasks,
    refetchInterval: !refetchDisabled ? 5000 : false,
    select: (allTasks) => {
      const uniqSorted = allTasks
        .filter((task) =>
          filters?.addon ? filters.addon === task.addon : true
        )
        // sort by application.id (ascending) then createTime (newest to oldest)
        .sort((a, b) =>
          a.application.id !== b.application.id
            ? a.application.id - b.application.id
            : -1 * universalComparator(a.createTime, b.createTime)
        )
        // remove old tasks for each application
        .filter(
          (task, index, tasks) =>
            index === 0 ||
            task.application.id !== tasks[index - 1].application.id
        );

      return uniqSorted;
    },
    onError: (err) => console.log(err),
  });
  const hasActiveTasks = data && data.length > 0;

  return {
    tasks: data || [],
    isFetching: isLoading,
    fetchError: error,
    refetch,
    hasActiveTasks,
  };
};

export const useDeleteTaskMutation = (
  onSuccess: () => void,
  onError: (err: Error | null) => void
) => {
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: (err: Error) => {
      onError && onError(err);
    },
  });
};

export const useCancelTaskMutation = (
  onSuccess: () => void,
  onError: (err: Error | null) => void
) => {
  return useMutation({
    mutationFn: cancelTask,
    onSuccess: () => {
      onSuccess && onSuccess();
    },
    onError: (err: Error) => {
      onError && onError(err);
    },
  });
};

export const TaskByIDQueryKey = "taskByID";
export const TaskAttachmentByIDQueryKey = "taskAttachmentByID";

export const useFetchTaskByIdAndFormat = ({
  taskId,
  format = "json",
  merged = false,
  enabled = true,
}: {
  taskId?: number;
  format?: "json" | "yaml";
  merged?: boolean;
  enabled?: boolean;
}) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: [TaskByIDQueryKey, taskId, format, merged],
    queryFn: () =>
      taskId ? getTaskByIdAndFormat(taskId, format, merged) : undefined,
    enabled,
  });

  return {
    task: data,
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchAttachmentById = ({
  attachmentId,
  enabled = true,
}: {
  attachmentId?: number;
  enabled?: boolean;
}) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: [TaskAttachmentByIDQueryKey, attachmentId],
    queryFn: () => (attachmentId ? getTextFile(attachmentId) : undefined),
    enabled,
  });

  return {
    attachment: data,
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchTaskByID = (taskId?: number) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: [TaskByIDQueryKey, taskId],
    queryFn: () => (taskId ? getTaskById(taskId) : null),
    enabled: !!taskId,
  });

  return {
    task: data,
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};
