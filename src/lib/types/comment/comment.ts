import { CommentStatus, CommentType } from "@/lib/enums/comment.enum";

export interface Comment {
  id: string;
  commentType: CommentType;
  commentStatus: CommentStatus;
  text: string;
  rating?: number;
  userId: string;
  testId?: string;
  createdAt: string;
}