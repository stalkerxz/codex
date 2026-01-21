export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type SessionConfig = {
  token: string;
  workspaceId: string;
};

export const loadSession = (): SessionConfig => {
  if (typeof window === "undefined") {
    return { token: "", workspaceId: "" };
  }
  return {
    token: window.localStorage.getItem("postflow.token") ?? "",
    workspaceId: window.localStorage.getItem("postflow.workspaceId") ?? ""
  };
};

export const saveSession = (config: SessionConfig) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("postflow.token", config.token);
  window.localStorage.setItem("postflow.workspaceId", config.workspaceId);
};

export const apiFetch = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};
