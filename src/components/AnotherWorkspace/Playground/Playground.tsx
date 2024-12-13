import { useEffect, useRef } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { ISettings } from "../Workspace";
import { useRecoilState } from "recoil";
import { userCodeState } from "@/atoms/userCodeAtom";

// Programming languages for the code editor:
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import {
  addLineHighlightRange,
  clearLineHighlight,
  lineHighlightField,
} from "@/utils/temp/highlightLines";
import { ProblemType } from "@/utils/types/problemType";

type PlaygroundProps = {
  problem: ProblemType;
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const Playground: React.FC<PlaygroundProps> = ({
  problem,
  settings,
  setSettings,
}) => {
  const [userCodeModal, setUserCode] = useRecoilState(userCodeState);
  const editorViewRef = useRef<EditorView | null>(null);

  const handleCodeChange = (newCode: string) => {
    setUserCode((prev) => ({
      ...prev,
      codeEditor: { ...prev.codeEditor, content: newCode },
    }));
    localStorage.setItem("coding-editor", userCodeModal.codeEditor.content);
  };

  // Highlight a range of lines, e.g. from line 1 to 4
  const highlightLines = (start: number, end: number) => {
    const view = editorViewRef.current;
    if (!view) return;
    if (userCodeModal.codeEditor.highlightCode.enabled) {
      view.dispatch({
        effects: addLineHighlightRange.of({ fromLine: start, toLine: end }),
      });
    } else {
      view.dispatch({
        effects: clearLineHighlight.of(undefined),
      });
    }
  };

  useEffect(() => {
    if (editorViewRef.current) {
      highlightLines(
        userCodeModal.codeEditor.highlightCode.from,
        userCodeModal.codeEditor.highlightCode.to
      );
    }
  }, [userCodeModal.codeEditor.highlightCode]);

  useEffect(() => {
    handleCodeChange(problem.starterCode);
  }, []);

  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <div className="h-[calc(100vh-94px)] overflow-y-auto">
        <div className="w-full overflow-auto">
          <CodeMirror
            value={userCodeModal.codeEditor.content}
            theme={vscodeDark}
            onChange={handleCodeChange}
            extensions={[python(), lineHighlightField]}
            onCreateEditor={(view) => {
              editorViewRef.current = view;
            }}
            style={{ fontSize: settings.codeFontSize }}
          />
        </div>
      </div>
    </div>
  );
};

export default Playground;