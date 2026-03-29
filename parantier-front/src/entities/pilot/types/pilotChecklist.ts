export interface PilotChecklist {
  id: number;
  pilotId: number;
  content: string;
  isChecked: boolean;
  imageUrl?: string;
  imageFilename?: string;
  orderNum: number;
  createdAt: string;
}

export interface CreatePilotChecklistRequest {
  content: string;
  orderNum?: number;
}

export interface UpdatePilotChecklistRequest {
  content: string;
  isChecked: boolean;
  orderNum: number;
}
