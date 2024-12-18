import { ProblemType } from "@/utils/types/problemType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HighlightState {
  from: number;
  to: number;
}

export interface ChangeState {
  content: string;
  from: number;
  to: number | null;
}

interface EditorState {
  problem: ProblemType | null;
  codeEditor: {
    content: string;
    changeState: ChangeState;
    highlightCode: HighlightState;
  };
  descriptionEditor: {
    content: string;
    changeState: ChangeState;
    highlightDescription: HighlightState;
  };
  compilerOutput: {
    content: string;
    loading: boolean;
  };
}

const initialState: EditorState = {
  problem: null,
  codeEditor: {
    content: "",
    changeState: {
      content: "",
      from: NaN,
      to: NaN,
    },
    highlightCode: {
      from: NaN,
      to: NaN,
    },
  },
  descriptionEditor: {
    content: "",
    highlightDescription: {
      from: NaN,
      to: NaN,
    },
    changeState: {
      content: "",
      from: NaN,
      to: NaN,
    },
  },
  compilerOutput: {
    content: "",
    loading: false,
  },
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setProblem: (state, action: PayloadAction<ProblemType>) => {
      state.problem = action.payload;
      state.codeEditor.content = action.payload.starterCode;
      state.descriptionEditor.content = action.payload.problemDescription;
    },

    setCodeContent: (state, action: PayloadAction<string>) => {
      state.codeEditor.content = action.payload;
    },

    insertCode: (state, action: PayloadAction<ChangeState>) => {
      state.descriptionEditor.changeState = action.payload;
    },

    setDescriptionContent: (state, action: PayloadAction<string>) => {
      state.descriptionEditor.content = action.payload;
    },

    insertDescription: (state, action: PayloadAction<ChangeState>) => {
      state.descriptionEditor.changeState = action.payload;
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

    setLoadingCompilerOutput: (state, action: PayloadAction<boolean>) => {
      state.compilerOutput.loading = action.payload;
    },

    setCompilerOutput: (state, action: PayloadAction<string>) => {
      state.compilerOutput.content = action.payload;
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
  setCompilerOutput,
  setLoadingCompilerOutput,
  insertCode,
  insertDescription,
} = editorSlice.actions;

export default editorSlice.reducer;
