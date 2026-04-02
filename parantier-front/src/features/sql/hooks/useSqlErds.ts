import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sqlErdApi } from "@/features/sql/api/sqlErdApi";
import type { CreateErdRequest, UpdateErdRequest } from "@/features/sql/api/sqlErdApi";
import { toast } from "sonner";

export function useSqlErds() {
  return useQuery({
    queryKey: ["sql-erds"],
    queryFn: () => sqlErdApi.getAll(),
  });
}

export function useCreateErd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateErdRequest) => sqlErdApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sql-erds"] });
      toast.success("ERD가 추가되었습니다.");
    },
    onError: () => {
      toast.error("ERD 추가에 실패했습니다.");
    },
  });
}

export function useUpdateErd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateErdRequest }) =>
      sqlErdApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sql-erds"] });
      toast.success("ERD가 수정되었습니다.");
    },
    onError: () => {
      toast.error("ERD 수정에 실패했습니다.");
    },
  });
}

export function useDeleteErd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sqlErdApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sql-erds"] });
      toast.success("ERD가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("ERD 삭제에 실패했습니다.");
    },
  });
}
