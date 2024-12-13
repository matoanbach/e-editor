// import CircleSkeleton from "@/components/Skeletons/CircleSkeleton";
// import RectangleSkeleton from "@/components/Skeletons/RectangleSkeleton";
import CodeMirror from "@uiw/react-codemirror";
import Split from "react-split";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef, useState } from "react";
import { ISettings } from "../Workspace";
import { useRecoilState } from "recoil";
import { userCodeState } from "@/atoms/userCodeAtom";
import {
  addLineHighlightRange,
  clearLineHighlight,
  lineHighlightField,
} from "@/utils/temp/highlightLines";
import { ProblemType } from "@/utils/types/problemType";
import EditorFooter from "../Playground/EditorFooter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { setDescriptionContent } from "@/state/editor/editorSlice";

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
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden">
        <div
          className={
            "bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"
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
            extensions={[customTheme, lineHighlightField]}
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
        <div className="w-full px-5 overflow-auto">
          {/* <div className="flex h-10 items-center space-x-6">
            <div className="relative flex h-full flex-col justify-center cursor-pointer">
              <div className="text-sm font-medium leading-5 text-white">
                Testcases
              </div>
              <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
            </div>
          </div>

          <div className="flex">
            {problem.examples.map((example, index) => (
              <div className="mr-2 items-start mt-2 " key={example.id}>
                <div className="flex flex-wrap items-center gap-y-4">
                  <div
                    className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap text-red-50
									  `}
                  >
                    Case {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="font-semibold my-4">
            <p className="text-sm font-medium mt-4 text-white">Input:</p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
            </div>
            <p className="text-sm font-medium mt-4 text-white">Output:</p>
            <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
            </div>
          </div> */}
        </div>
      </Split>
      <EditorFooter />
    </div>
  );
};
export default ProblemDescription;
