import { CommentType } from "@/lib/enums/comment.enum";

export interface CommentInput {
  commentType: CommentType;
  text: string;
  rating?: number;
  testId?: string;
}