const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface HackathonApiDocCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface HackathonApiDocSection {
  id: number;
  categoryId: number;
  title: string;
  orderNum: number;
}

export interface HackathonApiDocBlock {
  id?: number;
  sectionId?: number;
  blockType: string;
  content: string;
  sortOrder?: number;
}

export const hackathonApiDocApi = {
  getCategories: (teamId: number): Promise<HackathonApiDocCategory[]> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/categories`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getSections: (
    teamId: number,
    categoryId: number,
  ): Promise<HackathonApiDocSection[]> =>
    fetch(
      `${BASE}/hackathon/teams/${teamId}/api-doc/categories/${categoryId}/sections`,
      { headers: getAuthHeaders() },
    )
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getBlocks: (
    teamId: number,
    sectionId: number,
  ): Promise<HackathonApiDocBlock[]> =>
    fetch(
      `${BASE}/hackathon/teams/${teamId}/api-doc/sections/${sectionId}/blocks`,
      { headers: getAuthHeaders() },
    )
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  saveBlocks: (
    teamId: number,
    sectionId: number,
    blocks: HackathonApiDocBlock[],
  ): Promise<void> =>
    fetch(
      `${BASE}/hackathon/teams/${teamId}/api-doc/sections/${sectionId}/blocks`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(blocks),
      },
    ).then((r) => {
      if (!r.ok) throw new Error("저장 실패");
    }),

  createCategory: (
    teamId: number,
    data: { name: string; icon: string; emoji: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateCategory: (
    teamId: number,
    id: number,
    data: { name: string; icon: string; emoji: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteCategory: (teamId: number, id: number): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  createSection: (
    teamId: number,
    data: { categoryId: number; title: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/sections`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateSection: (
    teamId: number,
    id: number,
    data: { title: string; orderNum: number },
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteSection: (teamId: number, id: number): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderCategories: (
    teamId: number,
    items: { id: number; orderNum: number }[],
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/categories/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderSections: (
    teamId: number,
    items: { id: number; orderNum: number }[],
  ): Promise<void> =>
    fetch(`${BASE}/hackathon/teams/${teamId}/api-doc/sections/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),
};
