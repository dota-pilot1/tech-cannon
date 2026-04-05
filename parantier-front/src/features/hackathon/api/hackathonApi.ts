import { apiClient } from "@/shared/api/client";
import type {
  HackathonEvent,
  HackathonTeamLink,
  HackathonTeamTask,
  HackathonTeamIssue,
  HackathonTeamFaq,
  HackathonTeamDoc,
  HackathonChatMessage,
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

export const hackathonApi = {
  // 이벤트
  getActiveEvent: async (): Promise<HackathonEvent> => {
    const { data } = await apiClient.get("/hackathon/events/active");
    return data;
  },

  // 채팅 히스토리
  getChatHistory: async (
    eventId: number,
    limit = 50,
  ): Promise<HackathonChatMessage[]> => {
    const { data } = await apiClient.get(`/hackathon/events/${eventId}/chat`, {
      params: { limit },
    });
    return data;
  },

  // 링크
  getLinks: async (teamId: number): Promise<HackathonTeamLink[]> => {
    const { data } = await apiClient.get(`/hackathon/teams/${teamId}/links`);
    return data;
  },
  addLink: async (teamId: number, req: CreateLinkRequest): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/teams/${teamId}/links`,
      req,
    );
    return data;
  },
  deleteLink: async (teamId: number, linkId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}/links/${linkId}`);
  },

  // Task
  getTasks: async (teamId: number): Promise<HackathonTeamTask[]> => {
    const { data } = await apiClient.get(`/hackathon/teams/${teamId}/tasks`);
    return data;
  },
  createTask: async (
    teamId: number,
    req: CreateTaskRequest,
  ): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/teams/${teamId}/tasks`,
      req,
    );
    return data;
  },
  updateTask: async (
    teamId: number,
    taskId: number,
    req: UpdateTaskRequest,
  ): Promise<void> => {
    await apiClient.put(`/hackathon/teams/${teamId}/tasks/${taskId}`, req);
  },
  deleteTask: async (teamId: number, taskId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}/tasks/${taskId}`);
  },

  // Issue
  getIssues: async (teamId: number): Promise<HackathonTeamIssue[]> => {
    const { data } = await apiClient.get(`/hackathon/teams/${teamId}/issues`);
    return data;
  },
  createIssue: async (
    teamId: number,
    req: CreateIssueRequest,
  ): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/teams/${teamId}/issues`,
      req,
    );
    return data;
  },
  updateIssue: async (
    teamId: number,
    issueId: number,
    req: UpdateIssueRequest,
  ): Promise<void> => {
    await apiClient.put(`/hackathon/teams/${teamId}/issues/${issueId}`, req);
  },

  // FAQ
  getFaqs: async (teamId: number): Promise<HackathonTeamFaq[]> => {
    const { data } = await apiClient.get(`/hackathon/teams/${teamId}/faq`);
    return data;
  },
  createFaq: async (teamId: number, req: CreateFaqRequest): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/teams/${teamId}/faq`,
      req,
    );
    return data;
  },
  updateFaq: async (
    teamId: number,
    faqId: number,
    req: UpdateFaqRequest,
  ): Promise<void> => {
    await apiClient.put(`/hackathon/teams/${teamId}/faq/${faqId}`, req);
  },
  deleteFaq: async (teamId: number, faqId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}/faq/${faqId}`);
  },

  // Docs
  getDocs: async (teamId: number): Promise<HackathonTeamDoc[]> => {
    const { data } = await apiClient.get(`/hackathon/teams/${teamId}/docs`);
    return data;
  },
  getDoc: async (teamId: number, docId: number): Promise<HackathonTeamDoc> => {
    const { data } = await apiClient.get(
      `/hackathon/teams/${teamId}/docs/${docId}`,
    );
    return data;
  },
  createDoc: async (teamId: number, req: CreateDocRequest): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/teams/${teamId}/docs`,
      req,
    );
    return data.id;
  },
  updateDoc: async (
    teamId: number,
    docId: number,
    req: UpdateDocRequest,
  ): Promise<void> => {
    await apiClient.put(`/hackathon/teams/${teamId}/docs/${docId}`, req);
  },
  deleteDoc: async (teamId: number, docId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}/docs/${docId}`);
  },

  // 멤버
  addMember: async (teamId: number, userId: number): Promise<void> => {
    await apiClient.post(`/hackathon/teams/${teamId}/members`, { userId });
  },
  removeMember: async (teamId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}/members/${userId}`);
  },

  // 팀 CRUD
  createTeam: async (
    eventId: number,
    req: {
      name: string;
      project?: string;
      colorTheme?: string;
      orderNum?: number;
    },
  ): Promise<number> => {
    const { data } = await apiClient.post(
      `/hackathon/events/${eventId}/teams`,
      req,
    );
    return data.id;
  },
  updateTeam: async (
    teamId: number,
    req: {
      name: string;
      project?: string;
      colorTheme?: string;
      orderNum?: number;
    },
  ): Promise<void> => {
    await apiClient.put(`/hackathon/teams/${teamId}`, req);
  },
  deleteTeam: async (teamId: number): Promise<void> => {
    await apiClient.delete(`/hackathon/teams/${teamId}`);
  },
};
