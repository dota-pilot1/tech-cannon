const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface ArchCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface ArchSection {
  id: number;
  categoryId: number;
  title: string;
  orderNum: number;
}

export interface ArchBlock {
  id?: number;
  sectionId?: number;
  blockType: string;
  content: string;
  sortOrder?: number;
}

export const architectureApi = {
  getCategories: (): Promise<ArchCategory[]> =>
    fetch(`${BASE}/architecture/categories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getSections: (categoryId: number): Promise<ArchSection[]> =>
    fetch(`${BASE}/architecture/categories/${categoryId}/sections`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getBlocks: (sectionId: number): Promise<ArchBlock[]> =>
    fetch(`${BASE}/architecture/sections/${sectionId}/blocks`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  saveBlocks: (sectionId: number, blocks: ArchBlock[]): Promise<void> =>
    fetch(`${BASE}/architecture/sections/${sectionId}/blocks`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(blocks),
    }).then((r) => {
      if (!r.ok) throw new Error("저장 실패");
    }),

  createCategory: (data: {
    name: string;
    icon: string;
    emoji: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/architecture/categories`, {
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
    fetch(`${BASE}/architecture/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteCategory: (id: number): Promise<void> =>
    fetch(`${BASE}/architecture/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  createSection: (data: {
    categoryId: number;
    title: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/architecture/sections`, {
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
    fetch(`${BASE}/architecture/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteSection: (id: number): Promise<void> =>
    fetch(`${BASE}/architecture/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),
};
