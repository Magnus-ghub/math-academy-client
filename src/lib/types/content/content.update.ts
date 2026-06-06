import { ContentStatus } from "@/lib/enums/content.enum";

export interface ContentUpdate {
  title?: string;
  desc?: string;
  contentImage?: string;
  contentVideo?: string;
  contentStatus?: ContentStatus;
}