export interface IssueFigma {
  id: number;
  issueId: number;
  title: string;
  url: string;
  description?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFigmaRequest {
  title: string;
  url: string;
  description?: string;
  orderNum?: number;
}

export interface UpdateFigmaRequest {
  title: string;
  url: string;
  description?: string;
  orderNum: number;
}
