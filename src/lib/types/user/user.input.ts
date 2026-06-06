import { UserAuthType } from "@/lib/enums/user.enum";

export interface TelegramLoginInput {
  telegramId: string;
  hash: string;
  authDate: number;
  userName?: string;
  userLastName?: string;
  userImage?: string;
}

export interface GoogleLoginInput {
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
}