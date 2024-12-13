import { problems } from "@/utils/problems";
import { ProblemType } from "@/utils/types/problemType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HighlightState {
  enabled: boolean;
  from: number;
  to: number;
}

interface EditorState {
  problem: ProblemType | null;
  codeEditor: {
    content: string;
    highlightCode: HighlightState;
  };
  descriptionEditor: {
    content: string;
    highlightDescription: HighlightState;
  };
}

const initialState: EditorState = {
  problem: null,
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

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setProblem: (state, action: PayloadAction<ProblemType>) => {
      // state.codeEditor = initialState.codeEditor;
      // state.descriptionEditor = initialState.descriptionEditor;
      // console.log("called: ", action.payload);
      state.problem = action.payload;
      state.codeEditor.content = action.payload.starterCode;
      state.descriptionEditor.content = action.payload.problemDescription;
    },
    setCodeContent: (state, action: PayloadAction<string>) => {
      state.codeEditor.content = action.payload;
    },
    setDescriptionContent: (state, action: PayloadAction<string>) => {
      state.descriptionEditor.content = action.payload;
    },
    setHighlighCode: (state, action: PayloadAction<HighlightState>) => {
      state.codeEditor.highlightCode = action.payload;
    },
    setHighlighDecription: (state, action: PayloadAction<HighlightState>) => {
      state.descriptionEditor.highlightDescription = action.payload;
    },
    resetEditorState: (state) => {
      state.codeEditor = initialState.codeEditor;
      state.descriptionEditor = initialState.descriptionEditor;
    },
  },
});

export const {
  setProblem,
  setCodeContent,
  setDescriptionContent,
  setHighlighCode,
  setHighlighDecription,
  resetEditorState,
} = editorSlice.actions;

export default editorSlice.reducer;
