import { atom } from "recoil";

type UserCodeState = {
    codeEditor: string;
    descriptionEditor: string;
}

const initialUserCodeState : UserCodeState = {
    codeEditor: "",
    descriptionEditor: "",
}

export const userCodeState = atom<UserCodeState>({
    key: "userCodeState",
    default: initialUserCodeState
})
