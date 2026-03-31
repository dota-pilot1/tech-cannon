import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workApi } from "@/entities/work/api/workApi";
import type {
  WorkFilters,
  CreateWorkRequest,
  UpdateWorkRequest,
} from "@/entities/work/types/work";
import { toast } from "sonner";

export function useWorks(filters?: WorkFilters) {
  return useQuery({
    queryKey: ["works", filters],
    queryFn: () => workApi.getWorks(filters),
  });
}

export function useWork(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["works", id],
    queryFn: () => workApi.getWork(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreateWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateWorkRequest) => workApi.createWork(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("업무가 생성되었습니다.");
    },
    onError: () => {
      toast.error("업무 생성에 실패했습니다.");
    },
  });
}

export function useUpdateWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateWorkRequest }) =>
      workApi.updateWork(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("업무가 수정되었습니다.");
    },
    onError: () => {
      toast.error("업무 수정에 실패했습니다.");
    },
  });
}

export function useDeleteWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workApi.deleteWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("업무가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("업무 삭제에 실패했습니다.");
    },
  });
}

export function useUpdateWorkStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      workApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("상태가 변경되었습니다.");
    },
    onError: () => {
      toast.error("상태 변경에 실패했습니다.");
    },
  });
}

export function useUpdateWorkAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assigneeId,
    }: {
      id: number;
      assigneeId: number | null;
    }) => workApi.updateAssignee(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("담당자가 변경되었습니다.");
    },
    onError: () => {
      toast.error("담당자 변경에 실패했습니다.");
    },
  });
}

export function useUpdateWorkPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: string }) =>
      workApi.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
      toast.success("우선순위가 변경되었습니다.");
    },
    onError: () => {
      toast.error("우선순위 변경에 실패했습니다.");
    },
  });
}

// 일괄 작업용 훅 (자동 invalidate/toast 없음)
export function useCreateWorkSilent() {
  return useMutation({
    mutationFn: (request: CreateWorkRequest) => workApi.createWork(request),
  });
}

export function useUpdateWorkSilent() {
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateWorkRequest }) =>
      workApi.updateWork(id, request),
  });
}
