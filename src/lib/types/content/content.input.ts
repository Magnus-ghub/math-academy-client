import { ContentType } from "@/lib/enums/content.enum";

export interface ContentInput {
  contentType: ContentType;
  title: string;
  desc?: string;
  contentImage?: string;
  contentVideo?: string;
}