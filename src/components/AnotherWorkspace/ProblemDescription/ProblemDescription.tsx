import CodeMirror from "@uiw/react-codemirror";
import Split from "react-split";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { ISettings } from "../Workspace";
import {
  addLineHighlightRange,
  clearLineHighlight,
  lineHighlightField,
} from "@/utils/temp/highlightLines";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { setDescriptionContent } from "@/state/editor/editorSlice";
import Compiler from "@/components/Compiler/Compiler";

type ProblemDescriptionProps = {
  settings: ISettings;
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  settings,
}) => {
  const editorViewRef = useRef<EditorView | null>(null);
  // const [userCodeModal, setUserCode] = useRecoilState(userCodeState);
  const { descriptionEditor, problem } = useSelector((state: RootState) => state.editorSlice)
  const dispatch = useDispatch<AppDispatch>()


  const handleDescriptionChange = (newDescription: string) => {
    // setUserCode((prev) => ({
    //   ...prev,
    //   descriptionEditor: { ...prev.descriptionEditor, content: newDescription },
    // }));
    dispatch(setDescriptionContent(newDescription));

    localStorage.setItem("description-editor", descriptionEditor.content);
  };

  const customTheme = EditorView.theme(
    {
      "&": {
        color: "#ff6347", // Tomato color for text
        backgroundColor: "#282c34", // Dark background
      },
      ".cm-content": {
        caretColor: "#ff6347", // Custom caret color
      },
      ".cm-line": {
        color: settings.textColor, // Text color for each line
        // color: "#ff6347"
      },
    },
    { dark: true }
  ); // Set to dark mode if applicable

  // Highlight a range of lines, e.g. from line 1 to 4
  const highlightLines = (start: number, end: number) => {
    const view = editorViewRef.current;
    if (!view) return;
    if (descriptionEditor.highlightDescription.enabled) {
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
        descriptionEditor.highlightDescription.from,
        descriptionEditor.highlightDescription.to
      );
    }
  }, [descriptionEditor.highlightDescription]);

  useEffect(() => {
    handleDescriptionChange(problem ? problem.problemDescription : "")
  }, [problem])

  return (
    <div className="flex flex-col bg-dark-layer-2 relative overflow-x-hidden">
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-1 text-white overflow-x-hidden">
        <div
          className={
            "bg-dark-layer-2 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer select-none"
          }
        >
          Description
        </div>
      </div>

      <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
      >
        <div className="w-full overflow-auto">
          <CodeMirror
            value={descriptionEditor.content}
            className="cm-outer-container"
            extensions={[customTheme, lineHighlightField, EditorView.lineWrapping]}
            onChange={handleDescriptionChange}
            theme={vscodeDark}
            style={{
              fontSize: settings.textFontSize,
              font: "'JetBrains Mono', monospace",
            }}
            onCreateEditor={(view) => {
              editorViewRef.current = view;
            }}
          />
        </div>
        {/* Below is the area to display the result of the compiled code */}
        <div className="w-full overflow-auto">
          <Compiler />
        </div>
      </Split>
      {/* <EditorFooter /> */}
    </div>
  );
};
export default ProblemDescription;
