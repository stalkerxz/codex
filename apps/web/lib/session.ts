"use client";

import { useEffect, useState } from "react";
import { loadSession, SessionConfig, SESSION_EVENT } from "./api";

const tokenKey = "postflow.token";
const workspaceKey = "postflow.workspaceId";

export const useSession = (): SessionConfig => {
  const [session, setSession] = useState<SessionConfig>(() => loadSession());

  useEffect(() => {
    const handleSessionChange = () => {
      setSession(loadSession());
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === tokenKey || event.key === workspaceKey) {
        handleSessionChange();
      }
    };

    window.addEventListener(SESSION_EVENT, handleSessionChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(SESSION_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return session;
};
