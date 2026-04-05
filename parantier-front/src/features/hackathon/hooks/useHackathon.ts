import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hackathonApi } from "../api/hackathonApi";
import type {
  CreateLinkRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateIssueRequest,
  UpdateIssueRequest,
  CreateFaqRequest,
  UpdateFaqRequest,
  CreateDocRequest,
  UpdateDocRequest,
} from "../types/hackathon.types";

// ── 멤버 참가/탈퇴 ──
export function useJoinTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      hackathonApi.addMember(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-event-active"] });
      toast.success("팀에 참가했습니다!");
    },
    onError: () => toast.error("참가에 실패했습니다."),
  });
}

export function useLeaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      hackathonApi.removeMember(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-event-active"] });
      toast.success("팀에서 탈퇴했습니다.");
    },
    onError: () => toast.error("탈퇴에 실패했습니다."),
  });
}

export function useActiveEvent() {
  return useQuery({
    queryKey: ["hackathon-event-active"],
    queryFn: () => hackathonApi.getActiveEvent(),
    staleTime: 1000 * 60 * 5,
  });
}

// ── Links ──
export function useTeamLinks(teamId: number | null) {
  return useQuery({
    queryKey: ["hackathon-links", teamId],
    queryFn: () => hackathonApi.getLinks(teamId!),
    enabled: !!teamId,
  });
}
export function useAddLink(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateLinkRequest) => hackathonApi.addLink(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-links", teamId] });
      toast.success("링크가 추가됐습니다.");
    },
    onError: () => toast.error("링크 추가에 실패했습니다."),
  });
}
export function useDeleteLink(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) => hackathonApi.deleteLink(teamId, linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-links", teamId] });
      toast.success("링크가 삭제됐습니다.");
    },
    onError: () => toast.error("링크 삭제에 실패했습니다."),
  });
}

// ── Tasks ──
export function useTeamTasks(teamId: number | null) {
  return useQuery({
    queryKey: ["hackathon-tasks", teamId],
    queryFn: () => hackathonApi.getTasks(teamId!),
    enabled: !!teamId,
  });
}
export function useCreateTask(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateTaskRequest) =>
      hackathonApi.createTask(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-tasks", teamId] });
      toast.success("Task가 추가됐습니다.");
    },
    onError: () => toast.error("Task 추가에 실패했습니다."),
  });
}
export function useUpdateTask(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, req }: { taskId: number; req: UpdateTaskRequest }) =>
      hackathonApi.updateTask(teamId, taskId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-tasks", teamId] });
    },
    onError: () => toast.error("Task 수정에 실패했습니다."),
  });
}
export function useDeleteTask(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => hackathonApi.deleteTask(teamId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-tasks", teamId] });
      toast.success("Task가 삭제됐습니다.");
    },
    onError: () => toast.error("Task 삭제에 실패했습니다."),
  });
}

// ── Issues ──
export function useTeamIssues(teamId: number | null) {
  return useQuery({
    queryKey: ["hackathon-issues", teamId],
    queryFn: () => hackathonApi.getIssues(teamId!),
    enabled: !!teamId,
  });
}
export function useCreateIssue(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateIssueRequest) =>
      hackathonApi.createIssue(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-issues", teamId] });
      toast.success("이슈가 등록됐습니다.");
    },
    onError: () => toast.error("이슈 등록에 실패했습니다."),
  });
}
export function useUpdateIssue(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      issueId,
      req,
    }: {
      issueId: number;
      req: UpdateIssueRequest;
    }) => hackathonApi.updateIssue(teamId, issueId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-issues", teamId] });
      toast.success("이슈가 수정됐습니다.");
    },
    onError: () => toast.error("이슈 수정에 실패했습니다."),
  });
}

// ── FAQs ──
export function useTeamFaqs(teamId: number | null) {
  return useQuery({
    queryKey: ["hackathon-faqs", teamId],
    queryFn: () => hackathonApi.getFaqs(teamId!),
    enabled: !!teamId,
  });
}
export function useCreateFaq(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateFaqRequest) => hackathonApi.createFaq(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-faqs", teamId] });
      toast.success("Q&A가 추가됐습니다.");
    },
    onError: () => toast.error("Q&A 추가에 실패했습니다."),
  });
}
export function useUpdateFaq(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ faqId, req }: { faqId: number; req: UpdateFaqRequest }) =>
      hackathonApi.updateFaq(teamId, faqId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-faqs", teamId] });
      toast.success("Q&A가 수정됐습니다.");
    },
    onError: () => toast.error("Q&A 수정에 실패했습니다."),
  });
}
export function useDeleteFaq(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (faqId: number) => hackathonApi.deleteFaq(teamId, faqId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-faqs", teamId] });
      toast.success("Q&A가 삭제됐습니다.");
    },
    onError: () => toast.error("Q&A 삭제에 실패했습니다."),
  });
}

// ── Docs ──
export function useTeamDocs(teamId: number | null) {
  return useQuery({
    queryKey: ["hackathon-docs", teamId],
    queryFn: () => hackathonApi.getDocs(teamId!),
    enabled: !!teamId,
  });
}
export function useCreateDoc(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateDocRequest) => hackathonApi.createDoc(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-docs", teamId] });
      toast.success("문서가 추가됐습니다.");
    },
    onError: () => toast.error("문서 추가에 실패했습니다."),
  });
}
export function useUpdateDoc(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, req }: { docId: number; req: UpdateDocRequest }) =>
      hackathonApi.updateDoc(teamId, docId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-docs", teamId] });
      toast.success("문서가 수정됐습니다.");
    },
    onError: () => toast.error("문서 수정에 실패했습니다."),
  });
}
export function useDeleteDoc(teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) => hackathonApi.deleteDoc(teamId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-docs", teamId] });
      toast.success("문서가 삭제됐습니다.");
    },
    onError: () => toast.error("문서 삭제에 실패했습니다."),
  });
}

// ── Team CRUD ──
export function useCreateTeam(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: {
      name: string;
      project?: string;
      colorTheme?: string;
    }) => hackathonApi.createTeam(eventId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-event-active"] });
      toast.success("팀이 추가됐습니다.");
    },
    onError: () => toast.error("팀 추가에 실패했습니다."),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      teamId,
      req,
    }: {
      teamId: number;
      req: { name: string; project?: string; colorTheme?: string };
    }) => hackathonApi.updateTeam(teamId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-event-active"] });
      toast.success("팀 정보가 수정됐습니다.");
    },
    onError: () => toast.error("팀 수정에 실패했습니다."),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => hackathonApi.deleteTeam(teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hackathon-event-active"] });
      toast.success("팀이 삭제됐습니다.");
    },
    onError: () => toast.error("팀 삭제에 실패했습니다."),
  });
}
