import { GroupType, GroupStatus } from "@/lib/enums/group.enum";

export interface Group {
  id: string;
  groupType: GroupType;
  groupStatus: GroupStatus;
  groupName: string;
  telegramChatId: string;
  durationMonths: number;
  groupDesc?: string;
  memberCount: number;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserGroup {
  id: string;
  userId: string;
  groupId: string;
  groupType: GroupType;
  expiresAt: string;
  joinedAt: string;
}