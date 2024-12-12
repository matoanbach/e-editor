import React, { useEffect, useState } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";

import { userCodeState } from "@/atoms/userCodeAtom";
import { useRecoilState } from "recoil";

type PlaygroundProps = {
  problem: Problem;
};

const Playground: React.FC<PlaygroundProps> = ({ problem }) => {
  // const [userCode, setUserCode] = useState<string>(problem.starterCode);
  const [userCodeModal, setUserCode] = useRecoilState(userCodeState);

  const handleCodeChange = (newCode: string) => {
    localStorage.setItem("coding-editor", userCodeModal.codeEditor);
    setUserCode((prev) => ({ ...prev, userCode: newCode }));
  };

  // useEffect(() => {
  //   console.log(userCodeModal.userCode);
  // }, [userCodeModal]);

  useEffect(() => {
    handleCodeChange(problem.starterCode);
  }, []);

  // useEffect(() => {
  //   console.log(userCodeModal.userCode);
  //   localStorage.setItem("coding-editor", userCodeModal.userCode);
  // }, [userCodeModal]);

  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav />
      <div className="h[calc(100vh-94px)] overflow-y-auto">
        <div className="w-full">
          <CodeMirror
            value={userCodeModal.codeEditor}
            theme={vscodeDark}
            onChange={handleCodeChange}
            extensions={[javascript()]}
            // style={{ fontSize: settings.fontSize }}
          />
        </div>
      </div>
      {/* <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        // sizes={[100, 0]}
        // minSize={100}
      >
        <div className="w-full">
          <CodeMirror
            value={userCodeModal.userCode}
            theme={vscodeDark}
            onChange={handleCodeChange}
            extensions={[javascript()]}
            // style={{ fontSize: settings.fontSize }}
          />
        </div>
      </Split> */}
    </div>
  );
};
export default Playground;
