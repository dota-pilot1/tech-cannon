import { Store } from "@tanstack/react-store";

interface ApiTokenState {
  token: string;
}

const TOKEN_KEY = "api-doc-jwt-token";

const loadToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
};

export const apiTokenStore = new Store<ApiTokenState>({
  token: loadToken(),
});

export const apiTokenActions = {
  setToken: (token: string) => {
    apiTokenStore.setState(() => ({ token }));
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // localStorage unavailable
    }
  },
  clearToken: () => {
    apiTokenStore.setState(() => ({ token: "" }));
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // localStorage unavailable
    }
  },
};
