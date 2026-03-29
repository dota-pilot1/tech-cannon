export interface PilotMindmap {
  id: number;
  pilotId: number;
  title: string;
  content: string;
  orderNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePilotMindmapRequest {
  title: string;
  content: string;
  orderNum?: number;
}

export interface UpdatePilotMindmapRequest {
  title: string;
  content: string;
  orderNum: number;
}
