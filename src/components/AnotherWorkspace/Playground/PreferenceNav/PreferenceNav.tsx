import {
  AiOutlineSetting,
} from "react-icons/ai";
import SettingsModal from "@/components/Modals/SettingsModal";
import { ISettings } from "../../Workspace";
import VoiceAssistant from "@/components/Buttons/VoiceAssistant/VoiceAssistant";
import Timer from "@/components/Timer/Timer";
// import SettingsModal from "@/components/Modals/SettingsModal";

type PreferenceNavProps = {
  settings: ISettings;
  setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
};

const PreferenceNav: React.FC<PreferenceNavProps> = ({
  setSettings,
  settings,
}) => {

  return (
    <div className="flex items-center justify-between bg-dark-layer-1 h-11 w-full ">
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-1 text-white overflow-x-hidden">
        <div className="bg-dark-layer-2 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer ">
          Python
        </div>
      </div>

      <div className="flex items-center m-2">
        <VoiceAssistant />

        <div className="preferenceBtn group mr-0">
          <div className="text-gray-300 text-2xl">
            <div onClick={() =>
              setSettings({ ...settings, settingsModalIsOpen: true })
            }>
              <AiOutlineSetting />
            </div>
          </div>
          <div className="preferenceBtn-tooltip">Setting</div>
        </div>

        <Timer />



      </div>
      {settings.settingsModalIsOpen && (
        <SettingsModal settings={settings} setSettings={setSettings} />
      )}


    </div>
  );
};
export default PreferenceNav;
