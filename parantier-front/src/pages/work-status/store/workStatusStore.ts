import { Store } from "@tanstack/react-store";

export interface ChatParticipant {
  userId: number;
  username: string;
}

export interface WorkStatusState {
  leftTab: "team" | "chat";
  chatParticipants: ChatParticipant[];
}

const initialState: WorkStatusState = {
  leftTab: "team",
  chatParticipants: [],
};

export const workStatusStore = new Store(initialState);

export const workStatusActions = {
  setLeftTab: (tab: "team" | "chat") => {
    workStatusStore.setState((state) => ({ ...state, leftTab: tab }));
  },

  setChatParticipants: (participants: ChatParticipant[]) => {
    workStatusStore.setState((state) => ({
      ...state,
      chatParticipants: participants,
    }));
  },

  clearChatParticipants: () => {
    workStatusStore.setState((state) => ({
      ...state,
      chatParticipants: [],
    }));
  },
};
