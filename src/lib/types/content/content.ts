import { ContentType, ContentStatus } from "@/lib/enums/content.enum";

export interface Content {
  id: string;
  contentType: ContentType;
  contentStatus: ContentStatus;
  title: string;
  desc?: string;
  contentImage?: string;
  contentVideo?: string;
  viewCount: number;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}