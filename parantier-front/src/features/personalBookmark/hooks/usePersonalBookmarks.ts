import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personalBookmarkApi } from "@/entities/personalBookmark/api/personalBookmarkApi";
import type {
  CreatePersonalBookmarkRequest,
  UpdatePersonalBookmarkRequest,
} from "@/entities/personalBookmark/types/personalBookmark";

const QUERY_KEY = ["personalBookmarks"] as const;

export function usePersonalBookmarks() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: personalBookmarkApi.getBookmarks,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreatePersonalBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreatePersonalBookmarkRequest) =>
      personalBookmarkApi.createBookmark(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePersonalBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdatePersonalBookmarkRequest }) =>
      personalBookmarkApi.updateBookmark(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePersonalBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => personalBookmarkApi.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
