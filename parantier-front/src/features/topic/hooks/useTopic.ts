import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicApi } from "../api/topicApi";

export function useTopics(keyword?: string) {
  return useQuery({
    queryKey: ["topics", keyword],
    queryFn: () => topicApi.getTopics(keyword),
  });
}

export function useTopic(topicId: number | null) {
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: () => topicApi.getTopic(topicId!),
    enabled: topicId != null,
  });
}

export function useCreateTopic(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: { title: string; content: string }) => topicApi.createTopic(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      onSuccess?.();
    },
  });
}

export function useUpdateTopic(topicId: number, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: { title: string; content: string }) => topicApi.updateTopic(topicId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["topic", topicId] });
      onSuccess?.();
    },
  });
}

export function useDeleteTopic(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topicApi.deleteTopic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      onSuccess?.();
    },
  });
}

export function useToggleTopicPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topicApi.togglePin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useTopicComments(topicId: number | null) {
  return useQuery({
    queryKey: ["topic-comments", topicId],
    queryFn: () => topicApi.getComments(topicId!),
    enabled: topicId != null,
  });
}

export function useCreateTopicComment(topicId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => topicApi.createComment(topicId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topic-comments", topicId] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useDeleteTopicComment(topicId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => topicApi.deleteComment(topicId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topic-comments", topicId] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}
