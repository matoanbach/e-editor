import { atom } from "recoil";

type UserCodeState = {
    userCode: string
}

const initialUserCodeState : UserCodeState = {
    userCode: ""
}

export const userCodeState = atom<UserCodeState>({
    key: "userCodeState",
    default: initialUserCodeState
})
