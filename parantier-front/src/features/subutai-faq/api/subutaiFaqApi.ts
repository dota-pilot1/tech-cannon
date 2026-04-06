const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface SubutaiFaqCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface SubutaiFaqSection {
  id: number;
  categoryId: number;
  title: string;
  orderNum: number;
}

export interface SubutaiFaqBlock {
  id?: number;
  sectionId?: number;
  blockType: string;
  content: string;
  sortOrder?: number;
}

export const subutaiFaqApi = {
  getCategories: (): Promise<SubutaiFaqCategory[]> =>
    fetch(`${BASE}/subutai/faq/categories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getSections: (categoryId: number): Promise<SubutaiFaqSection[]> =>
    fetch(`${BASE}/subutai/faq/categories/${categoryId}/sections`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getBlocks: (sectionId: number): Promise<SubutaiFaqBlock[]> =>
    fetch(`${BASE}/subutai/faq/sections/${sectionId}/blocks`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  saveBlocks: (sectionId: number, blocks: SubutaiFaqBlock[]): Promise<void> =>
    fetch(`${BASE}/subutai/faq/sections/${sectionId}/blocks`, {
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
    fetch(`${BASE}/subutai/faq/categories`, {
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
    fetch(`${BASE}/subutai/faq/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteCategory: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/faq/categories/${id}`, {
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
    fetch(`${BASE}/subutai/faq/sections`, {
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
    fetch(`${BASE}/subutai/faq/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteSection: (id: number): Promise<void> =>
    fetch(`${BASE}/subutai/faq/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderCategories: (
    items: { id: number; orderNum: number }[],
  ): Promise<void> =>
    fetch(`${BASE}/subutai/faq/categories/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderSections: (items: { id: number; orderNum: number }[]): Promise<void> =>
    fetch(`${BASE}/subutai/faq/sections/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),
};
