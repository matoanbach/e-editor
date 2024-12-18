import { useState } from "react";
import Split from "react-split";
import ProblemDescription from "./ProblemDescription/ProblemDescription";
import Playground from "./Playground/Playground";


export interface ISettings {
  codeFontSize: string;
  textFontSize: string;
  textColor: string;
  settingsModalIsOpen: boolean;
  codeDropdownIsOpen: boolean;
  textDropdownIsOpen: boolean;
}

const Workspace: React.FC = () => {

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
      <ProblemDescription settings={settings} />
      <div className="bg-dark-fill-2">
        <Playground
          settings={settings}
          setSettings={setSettings}
        />
      </div>
    </Split>
  );
};
export default Workspace;
