import { Category } from "./category";

export interface Report {
  id: string;
  trackingId: string;
  title: string;
  content: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | string;
  createdAt: Date;
  updatedAt?: Date;
  evidence?: {
    fileType: string;
  }[];
  categoryId: string;
  category: Category;
}
