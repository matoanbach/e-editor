import { useState, useEffect } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import CodeMirror from "@uiw/react-codemirror";
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
  // const [userCode, setUserCode] = useState<string>(problem.starterCode || "");
  const [userCodeModal, setUserCode] = useRecoilState(userCodeState);

  // useEffect(() => {
  //   const problemKey = `coding-editor-${problem.id}`;
  //   const savedCode = localStorage.getItem(problemKey);
  //   if (savedCode) {
  //     setUserCode(JSON.parse(savedCode));
  //   }
  // }, [problem.id]);

  // const onChange = (value: string) => {
  //   setUserCode(value);
  //   const problemKey = `coding-editor-${problem.id}`;
  //   localStorage.setItem(problemKey, JSON.stringify(value));

  //   // // Optional: Update Firebase
  //   // clearTimeout(window.saveToFirebase);
  //   // window.saveToFirebase = setTimeout(async () => {
  //   //   const user = auth.currentUser;
  //   //   if (!user) return;

  //   //   const userDoc = doc(firestore, "users", user.uid);
  //   //   await updateDoc(userDoc, {
  //   //     [`problems.${problem.id}.code`]: value,
  //   //   });
  //   // }, 1000);
  // };

  const handleCodeChange = (newCode: string) => {
    setUserCode((prev) => ({ ...prev, codeEditor: newCode }));
    localStorage.setItem("coding-editor", userCodeModal.codeEditor);
  };

  useEffect(() => {
    handleCodeChange(problem.starterCode);
  }, []);

  // useEffect(() => {
  //   console.log("initial 2: ", userCodeModal.codeEditor);
  // }, [userCodeModal.codeEditor]);

  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <div className="h-[calc(100vh-94px)] overflow-y-auto">
        <div className="w-full overflow-auto">
          <CodeMirror
            value={userCodeModal.codeEditor}
            theme={vscodeDark}
            onChange={handleCodeChange}
            extensions={[python()]}
            style={{ fontSize: settings.codeFontSize }}
          />
        </div>
      </div>
    </div>
  );
};

export default Playground;
