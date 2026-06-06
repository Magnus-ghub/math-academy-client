import { GroupStatus } from "@/lib/enums/group.enum";

export interface GroupUpdate {
  groupName?: string;
  groupDesc?: string;
  durationMonths?: number;
  groupStatus?: GroupStatus;
  endedAt?: string;
}