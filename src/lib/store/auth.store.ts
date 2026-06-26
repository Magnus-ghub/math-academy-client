import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  userName: string;
  userLastName?: string;
  userRole: string;
  userStatus: string;
  userAuthType: string;
  userImage?: string;
  telegramId?: string;
  googleId?: string;
  premiumExpiresAt?: string;
}

export interface UserGroup {
  id: string;
  userId?: string;
  groupId: string;
  groupType: string;
  groupName?: string;
  expiresAt: string;
  joinedAt: string;
}

interface AuthState {
  user: User | null;
  groups: UserGroup[];
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, groups?: UserGroup[]) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      groups: [],
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, groups = []) => {
        if (typeof document !== "undefined") {
          const isSecure = location.protocol === "https:";
          const flags = `path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
          document.cookie = `auth-token=${accessToken}; ${flags}`;
        }
        set({ user, accessToken, groups, isAuthenticated: true });
      },

      logout: () => {
        if (typeof document !== "undefined") {
          const isSecure = location.protocol === "https:";
          const flags = `path=/; max-age=0; SameSite=Lax${isSecure ? "; Secure" : ""}`;
          document.cookie = `auth-token=; ${flags}`;
        }
        set({ user: null, accessToken: null, groups: [], isAuthenticated: false });
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
);
