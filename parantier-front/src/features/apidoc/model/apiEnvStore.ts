import { Store } from "@tanstack/react-store";
import type { ApiEnvironment } from "../types/apiDoc.types";

const DEFAULT_ENVS: ApiEnvironment[] = [
  {
    id: "local",
    name: "로컬",
    variables: [
      { key: "BASE_URL", value: "http://localhost:8080", description: "로컬 API 서버" },
      { key: "TOKEN", value: "", description: "JWT 토큰" },
    ],
  },
  {
    id: "dev",
    name: "개발",
    variables: [
      { key: "BASE_URL", value: "https://dev-api.example.com", description: "개발 서버" },
      { key: "TOKEN", value: "", description: "JWT 토큰" },
    ],
  },
  {
    id: "prod",
    name: "운영",
    variables: [
      { key: "BASE_URL", value: "https://api.example.com", description: "운영 서버" },
      { key: "TOKEN", value: "", description: "JWT 토큰" },
    ],
  },
];

interface ApiEnvState {
  environments: ApiEnvironment[];
  activeEnvId: string;
}

const STORAGE_KEY = "api-doc-environments";
const ACTIVE_KEY = "api-doc-active-env";

const loadFromStorage = (): ApiEnvState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const activeEnvId = localStorage.getItem(ACTIVE_KEY) ?? "local";
    const environments = stored ? JSON.parse(stored) : DEFAULT_ENVS;
    return { environments, activeEnvId };
  } catch {
    return { environments: DEFAULT_ENVS, activeEnvId: "local" };
  }
};

export const apiEnvStore = new Store<ApiEnvState>(loadFromStorage());

export const apiEnvActions = {
  setActiveEnv: (id: string) => {
    apiEnvStore.setState((s) => ({ ...s, activeEnvId: id }));
    localStorage.setItem(ACTIVE_KEY, id);
  },
  updateEnvironments: (envs: ApiEnvironment[]) => {
    apiEnvStore.setState((s) => ({ ...s, environments: envs }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envs));
  },
  getActiveVarsMap: (): Record<string, string> => {
    const { environments, activeEnvId } = apiEnvStore.state;
    const env = environments.find((e) => e.id === activeEnvId);
    if (!env) return {};
    return Object.fromEntries(env.variables.map((v) => [v.key, v.value]));
  },
};
