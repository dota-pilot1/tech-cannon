import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi } from "@/entities/bookmark/api/bookmarkApi";
import type { CreateBookmarkRequest } from "@/entities/bookmark/types/bookmark";

const QUERY_KEY = ["team-bookmarks"] as const;

export function useBookmarks() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: bookmarkApi.getBookmarks,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateBookmarkRequest) => bookmarkApi.createBookmark(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bookmarkApi.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
