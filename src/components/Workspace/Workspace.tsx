import React from "react";
import Split from "react-split";
import ProblemDescription from "./ProblemDescription/ProblemDescription";
import Playground from "./Playground/Playground";
import { Problem } from "@/utils/types/problem";

type WorkspaceProps = {
  problem: Problem;
};

// npm install @uiw/react-codemirror @codemirror/lang-javascript @uiw/codemirror-theme-vscode
const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  return (
    <Split className="split" minSize={0}>
      <ProblemDescription problem={problem}/>
      <Playground problem={problem}/>
    </Split>
  );
};
export default Workspace;
