import { atom } from "recoil";

type UserCodeState = {
  codeEditor: {
    content: string;
    highlightCode: {
      enabled: boolean;
      from: number;
      to: number;
    };
  };
  descriptionEditor: {
    content: string;
    highlightDescription: {
      enabled: boolean;
      from: number;
      to: number;
    };
  };
};

const initialUserCodeState: UserCodeState = {
  codeEditor: {
    content: "",
    highlightCode: {
      enabled: false,
      from: NaN,
      to: NaN,
    },
  },

  descriptionEditor: {
    content: "",
    highlightDescription: {
      enabled: false,
      from: NaN,
      to: NaN,
    },
  },
};

export const userCodeState = atom<UserCodeState>({
  key: "userCodeState",
  default: initialUserCodeState,
});
