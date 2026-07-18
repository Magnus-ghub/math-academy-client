import { UserRole, UserStatus, UserAuthType } from "@/lib/enums/user.enum";

export interface User {
  id: string;
  userRole: UserRole;
  userStatus: UserStatus;
  userAuthType: UserAuthType;
  userName?: string;
  userLastName?: string;
  userPhone?: string;
  userImage?: string;
  userAddress?: string;
  userRegion?: string;
  userDistrict?: string;
  userDesc?: string;
  telegramId?: string;
  googleId?: string;
  premiumExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}