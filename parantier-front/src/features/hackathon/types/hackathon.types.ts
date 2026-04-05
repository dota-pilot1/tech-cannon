export interface HackathonEvent {
  id: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  maxTeams: number;
  isActive: boolean;
  createdAt: string;
  teams: HackathonTeamResponse[];
}

export interface HackathonTeamResponse {
  id: number;
  eventId: number;
  name: string;
  project: string;
  colorTheme: string;
  orderNum: number;
  createdAt: string;
  members: TeamMemberInfo[];
}

export interface TeamMemberInfo {
  userId: number;
  username: string;
}

export interface HackathonChatMessage {
  id: number;
  eventId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  senderId?: number;
  senderName?: string;
  message?: string;
}

export interface HackathonTeamLink {
  id: number;
  teamId: number;
  linkType: string;
  title: string;
  url: string;
  createdBy?: number;
  createdAt: string;
}

export interface HackathonTeamTask {
  id: number;
  teamId: number;
  title: string;
  status: "TODO" | "DOING" | "DONE";
  assigneeId?: number;
  assigneeName?: string;
  dueAt?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HackathonTeamIssue {
  id: number;
  teamId: number;
  title: string;
  content?: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  assigneeId?: number;
  assigneeName?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HackathonTeamFaq {
  id: number;
  teamId: number;
  question: string;
  answer?: string;
  orderNum: number;
  createdBy?: number;
  createdAt: string;
}

export interface CreateLinkRequest {
  linkType: string;
  title: string;
  url: string;
}

export interface CreateTaskRequest {
  title: string;
  status: string;
  assigneeId?: number;
  dueAt?: string;
}

export interface UpdateTaskRequest {
  title: string;
  status: string;
  assigneeId?: number;
  dueAt?: string;
}

export interface CreateIssueRequest {
  title: string;
  content?: string;
  status: string;
  priority: string;
  assigneeId?: number;
}

export interface UpdateIssueRequest {
  title: string;
  content?: string;
  status: string;
  priority: string;
  assigneeId?: number;
}

export interface CreateFaqRequest {
  question: string;
  answer?: string;
  orderNum: number;
}

export interface UpdateFaqRequest {
  question: string;
  answer?: string;
  orderNum: number;
}

export interface HackathonTeamDoc {
  id: number;
  teamId: number;
  title: string;
  content?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocRequest {
  title: string;
  content?: string;
}

export interface UpdateDocRequest {
  title: string;
  content?: string;
}
