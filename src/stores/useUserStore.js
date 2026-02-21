import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      tokenExpiresAt: null,
      collapsed: true,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setTokenExpiresAt: (tokenExpiresAt) => set({ tokenExpiresAt }),
      setCollapsed: (collapsed) => set({ collapsed }),

      logout: () => {
        set({
          user: null,
          token: null,
          tokenExpiresAt: null,
          collapsed: true,
        });
        localStorage.removeItem("user-storage");
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenExpiresAt: state.tokenExpiresAt,
        collapsed: state.collapsed,
      }),
    }
  )
);

export default useUserStore;
