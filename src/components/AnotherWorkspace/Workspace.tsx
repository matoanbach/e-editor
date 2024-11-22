import { useState } from "react";
import Split from "react-split";
import ProblemDescription from "./ProblemDescription/ProblemDescription";
import Playground from "./Playground/Playground";
import { Problem } from "@/utils/types/problem";
import Confetti from "react-confetti";
// import useWindowSize from "@/hooks/useWindowSize";

type WorkspaceProps = {
  problem: Problem;
};

export interface ISettings {
  codeFontSize: string;
  textFontSize: string;
  textColor: string;
  settingsModalIsOpen: boolean;
  codeDropdownIsOpen: boolean;
  textDropdownIsOpen: boolean;
}

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
  // const { width, height } = useWindowSize();
  const [success, setSuccess] = useState(false);
  const [solved, setSolved] = useState(false);

  const [settings, setSettings] = useState<ISettings>({
    codeFontSize: "14px",
    textFontSize: "14px",
    textColor: "#6a9955",
    settingsModalIsOpen: false,
    codeDropdownIsOpen: false,
    textDropdownIsOpen: false,
  });

  return (
    <Split className="split" minSize={0}>
      <ProblemDescription problem={problem} _solved={solved} settings={settings} />
      <div className="bg-dark-fill-2">
        <Playground
          problem={problem}
          setSuccess={setSuccess}
          setSolved={setSolved}
          settings={settings}
          setSettings={setSettings}
        />
        {/* {success && <Confetti gravity={0.3} tweenDuration={4000} width={width - 1} height={height - 1} />} */}
      </div>
    </Split>
  );
};
export default Workspace;
