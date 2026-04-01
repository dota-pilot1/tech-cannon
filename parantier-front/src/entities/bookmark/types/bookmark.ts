export interface TeamBookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  category?: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
}

export interface CreateBookmarkRequest {
  title: string;
  url: string;
  description?: string;
  category?: string;
}
