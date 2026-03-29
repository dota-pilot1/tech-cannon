export interface PilotImage {
  id: number;
  pilotId: number;
  url: string;
  filename: string;
  fileType: string;
  createdAt: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
}
