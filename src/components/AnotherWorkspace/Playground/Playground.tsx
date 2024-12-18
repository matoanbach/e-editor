import { useEffect, useRef } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { ISettings } from "../Workspace";

// Programming languages for the code editor:
import { python } from "@codemirror/lang-python";
import {
  addLineHighlightRange,
  clearLineHighlight,
  lineHighlightField,
} from "@/utils/temp/highlightLines";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { setCodeContent } from "@/state/editor/editorSlice";

type PlaygroundProps = {
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const Playground: React.FC<PlaygroundProps> = ({
  settings,
  setSettings,
}) => {
  // const [userCodeModal, setUserCode] = useRecoilState(userCodeState);
  const editorViewRef = useRef<EditorView | null>(null);
  const { codeEditor, problem } = useSelector((state: RootState) => state.editorSlice)
  const dispatch = useDispatch<AppDispatch>()



  const handleCodeChange = (newCode: string) => {
    // setUserCode((prev) => ({
    //   ...prev,
    //   codeEditor: { ...prev.codeEditor, content: newCode },
    // }));
    dispatch(setCodeContent(newCode))

    localStorage.setItem("coding-editor", codeEditor.content);
  };

  // Highlight a range of lines, e.g. from line 1 to 4
  const highlightLines = (start: number, end: number) => {
    const view = editorViewRef.current;
    if (!view) return;

    // Add the line highlight effect
    view.dispatch({
      effects: addLineHighlightRange.of({ fromLine: start, toLine: end }),
    });

    // Automatically clear the highlight after 3 seconds
    setTimeout(() => {
      view.dispatch({
        effects: clearLineHighlight.of(undefined),
      });
    }, 3000); // 3000 ms = 3 seconds
  };


  const insertLines = (start: number, end: number | null, newCode: string) => {
    const view = editorViewRef.current;
    if (!view) return;
  
    // Determine the start and end positions
    const startPosition = view.state.doc.line(start).from;
    const endPosition = end ? view.state.doc.line(end).to : startPosition;
  
    // Dispatch a transaction for insertion or replacement
    const transaction = view.state.update({
      changes: {
        from: startPosition,
        to: end ? endPosition : startPosition,
        insert: newCode + '\n',
      },
    });
  
    view.dispatch(transaction);
  
    // Highlight the new or modified lines
    const newLines = newCode.split("\n").length;
    const highlightStart = start;
    const highlightEnd = end ? start + newLines - 1 : highlightStart + newLines - 1;
    highlightLines(highlightStart, highlightEnd);
  };

  useEffect(() => {
    if (editorViewRef.current) {
      highlightLines(
        codeEditor.highlightCode.from,
        codeEditor.highlightCode.to
      );
    }
  }, [codeEditor.highlightCode]);

  useEffect(() => {
    if (editorViewRef.current) {
      insertLines(codeEditor.changeState.from, codeEditor.changeState.to, codeEditor.changeState.content)
    }
  }, [codeEditor.changeState])

  useEffect(() => {
    handleCodeChange(problem ? problem.starterCode : "");
  }, [problem]);

  return (
    <div className="flex flex-col bg-dark-layer-2 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <div className="h-[calc(100vh-94px)] overflow-y-auto">
        <div className="w-full overflow-auto">
          <CodeMirror
            value={codeEditor.content}
            theme={vscodeDark}
            onChange={handleCodeChange}
            extensions={[python(), lineHighlightField, EditorView.lineWrapping]}
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