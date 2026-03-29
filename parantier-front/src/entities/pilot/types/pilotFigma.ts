export interface PilotFigma {
  id: number;
  pilotId: number;
  title: string;
  url: string;
  description?: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePilotFigmaRequest {
  title: string;
  url: string;
  description?: string;
  orderNum?: number;
}

export interface UpdatePilotFigmaRequest {
  title: string;
  url: string;
  description?: string;
  orderNum: number;
}
