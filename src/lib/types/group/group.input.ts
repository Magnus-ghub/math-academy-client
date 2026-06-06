import { GroupType } from "@/lib/enums/group.enum";

export interface GroupInput {
  groupType: GroupType;
  groupName: string;
  telegramChatId: string;
  durationMonths: number;
  groupDesc?: string;
}