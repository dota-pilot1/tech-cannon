const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE = API_BASE.endsWith("/api") ? API_BASE : API_BASE + "/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export interface FigmaCategory {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  orderNum: number;
}

export interface FigmaLink {
  id: number;
  categoryId: number;
  title: string;
  url: string;
  orderNum: number;
}

export const figmaApi = {
  getCategories: (): Promise<FigmaCategory[]> =>
    fetch(`${BASE}/figma/categories`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  getLinks: (categoryId: number): Promise<FigmaLink[]> =>
    fetch(`${BASE}/figma/categories/${categoryId}/links`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : [])),

  createCategory: (data: {
    name: string;
    icon: string;
    emoji: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/figma/categories`, {
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
    fetch(`${BASE}/figma/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteCategory: (id: number): Promise<void> =>
    fetch(`${BASE}/figma/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderCategories: (
    items: { id: number; orderNum: number }[],
  ): Promise<void> =>
    fetch(`${BASE}/figma/categories/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  createLink: (data: {
    categoryId: number;
    title: string;
    url: string;
    orderNum: number;
  }): Promise<void> =>
    fetch(`${BASE}/figma/links`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  updateLink: (
    id: number,
    data: {
      categoryId: number;
      title: string;
      url: string;
      orderNum: number;
    },
  ): Promise<void> =>
    fetch(`${BASE}/figma/links/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  deleteLink: (id: number): Promise<void> =>
    fetch(`${BASE}/figma/links/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),

  reorderLinks: (items: { id: number; orderNum: number }[]): Promise<void> =>
    fetch(`${BASE}/figma/links/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    }).then((r) => {
      if (!r.ok) throw new Error();
    }),
};
