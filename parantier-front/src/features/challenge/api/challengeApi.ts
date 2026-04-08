const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface ChallengeCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface ChallengeSection {
  id: number;
  categoryId: number;
  title: string;
  orderNum: number;
}

export interface ChallengeTopic {
  id?: number;
  sectionId?: number;
  blockType: string;
  content: string;
  sortOrder?: number;
}

export interface ChallengeSubmission {
  id: number;
  sectionId: number;
  userId: number;
  userName: string;
  githubUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const challengeApi = {
  // ── 카테고리 ──
  getCategories: (): Promise<ChallengeCategory[]> =>
    fetch(`${BASE}/challenge/categories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createCategory: (data: {
    name: string;
    icon: string;
    emoji: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/challenge/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateCategory: (
    id: number,
    data: { name: string; icon: string; emoji: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/challenge/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteCategory: (id: number): Promise<void> =>
    fetch(`${BASE}/challenge/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderCategories: (
    items: { id: number; orderNum: number }[],
  ): Promise<void> =>
    fetch(`${BASE}/challenge/categories/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  // ── 섹션 ──
  getSections: (categoryId: number): Promise<ChallengeSection[]> =>
    fetch(`${BASE}/challenge/categories/${categoryId}/sections`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createSection: (data: {
    categoryId: number;
    title: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/challenge/sections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateSection: (
    id: number,
    data: { title: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/challenge/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteSection: (id: number): Promise<void> =>
    fetch(`${BASE}/challenge/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderSections: (items: { id: number; orderNum: number }[]): Promise<void> =>
    fetch(`${BASE}/challenge/sections/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  // ── 주제 블록 ──
  getTopics: (sectionId: number): Promise<ChallengeTopic[]> =>
    fetch(`${BASE}/challenge/sections/${sectionId}/topics`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  saveTopics: (sectionId: number, topics: ChallengeTopic[]): Promise<void> =>
    fetch(`${BASE}/challenge/sections/${sectionId}/topics`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(topics),
    }).then((r) => {
      if (!r.ok) throw new Error("주제 저장 실패");
    }),

  // ── 풀이 제출 ──
  getSubmissions: (sectionId: number): Promise<ChallengeSubmission[]> =>
    fetch(`${BASE}/challenge/sections/${sectionId}/submissions`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createSubmission: (
    sectionId: number,
    data: { githubUrl: string; content: string },
  ): Promise<void> =>
    fetch(`${BASE}/challenge/sections/${sectionId}/submissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error("제출 실패");
    }),

  updateSubmission: (
    id: number,
    data: { githubUrl: string; content: string },
  ): Promise<void> =>
    fetch(`${BASE}/challenge/submissions/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error("수정 실패");
    }),

  deleteSubmission: (id: number): Promise<void> =>
    fetch(`${BASE}/challenge/submissions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error("삭제 실패");
    }),
};
