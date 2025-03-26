export interface Report {
  id: string;
  trackingId: string;
  title: string;
  content: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | string;
  createdAt: Date;
  updatedAt?: Date;
  evidence?: {
    fileType: string;
    // Add other file properties as needed
  }[];
}
