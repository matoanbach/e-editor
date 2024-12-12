import { useState, useEffect, useRef } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { Problem } from "@/utils/types/problem";
import { auth, firestore } from "@/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
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

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const Playground: React.FC<PlaygroundProps> = ({
  problem,
  setSuccess,
  setSolved,
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

  // return (
  //   <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
  //     <PreferenceNav settings={settings} setSettings={setSettings} />
  //     <div className="h-[calc(100vh-94px)] overflow-y-auto">
  //       <div className="w-full overflow-auto">
  //         <CodeMirror
  //           value={userCodeModal.codeEditor}
  //           theme={vscodeDark}
  //           onChange={handleCodeChange}
  //           extensions={[python()]}
  //           style={{ fontSize: settings.codeFontSize }}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );

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

// import React, { useState, useEffect, useRef } from "react";
// import PreferenceNav from "./PreferenceNav/PreferenceNav";
// import CodeMirror from "@uiw/react-codemirror";
// import { vscodeDark } from "@uiw/codemirror-theme-vscode";
// import { Problem } from "@/utils/types/problem";
// import { ISettings } from "../Workspace";
// import { useRecoilState } from "recoil";
// import { userCodeState } from "@/atoms/userCodeAtom";
// import { python } from "@codemirror/lang-python";

// // Import the updated line highlight logic
// import { EditorView } from "@codemirror/view";
// import {
//   addLineHighlightRange,
//   lineHighlightField,
// } from "@/utils/temp/highlightLines";

// type PlaygroundProps = {
//   problem: Problem;
//   setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
//   setSolved: React.Dispatch<React.SetStateAction<boolean>>;
//   settings: ISettings;
//   setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
// };

// const Playground: React.FC<PlaygroundProps> = ({
//   problem,
//   setSuccess,
//   setSolved,
//   settings,
//   setSettings,
// }) => {
//   const [userCodeModal, setUserCode] = useRecoilState(userCodeState);
//   const editorViewRef = useRef<EditorView | null>(null);

//   const handleCodeChange = (newCode: string) => {
//     setUserCode((prev) => ({ ...prev, codeEditor: newCode }));
//     localStorage.setItem("coding-editor", newCode);
//   };

//   useEffect(() => {
//     // Initialize code with problem starter code
//     handleCodeChange(problem.starterCode);
//   }, [problem.starterCode]);

//   // Highlight a range of lines, e.g. from line 1 to 4
//   const highlightLines = (start: number, end: number) => {
//     const view = editorViewRef.current;
//     if (!view) return;
//     view.dispatch({
//       effects: addLineHighlightRange.of({ fromLine: start, toLine: end }),
//     });
//   };

//   // useEffect(() => {
//   //   // Example: After initial load, highlight lines 1 through 4
//   //   if (editorViewRef.current) {
//   //     highlightLines(-1, -1);
//   //   }
//   // }, [userCodeState.highlightCode]);

//   return (
//     <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
//       <PreferenceNav settings={settings} setSettings={setSettings} />
//       <div className="h-[calc(100vh-94px)] overflow-y-auto">
//         <div className="w-full overflow-auto">
//           <CodeMirror
//             value={userCodeModal.codeEditor}
//             theme={vscodeDark}
//             onChange={handleCodeChange}
//             extensions={[python(), lineHighlightField]}
//             onCreateEditor={(view) => {
//               editorViewRef.current = view;
//             }}
//             style={{ fontSize: settings.codeFontSize }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Playground;
