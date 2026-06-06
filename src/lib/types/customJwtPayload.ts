import { UserRole } from "@/lib/enums/user.enum";
import { GroupType } from "@/lib/enums/group.enum";

export interface JwtGroupPayload {
  groupId: string;
  groupType: GroupType;
  expiresAt: string;
}

export interface CustomJwtPayload {
  userId: string;
  userRole: UserRole;
  groups: JwtGroupPayload[];
  iat: number;
  exp: number;
}