export interface PersonalBookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  category?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonalBookmarkRequest {
  title: string;
  url: string;
  description?: string;
  category?: string;
  sortOrder?: number;
}

export interface UpdatePersonalBookmarkRequest {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  sortOrder?: number;
}
