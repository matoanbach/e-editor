import VoiceAssistant from "@/components/Buttons/VoiceAssistant/VoiceAssistant";
import React from "react";
import { AiOutlineFullscreen, AiOutlineSetting } from "react-icons/ai";
import { RiVoiceprintLine } from "react-icons/ri";

type PreferenceNavProps = {};

const PreferenceNav: React.FC<PreferenceNavProps> = () => {
  return (
    <div className="flex items-center justify-between bg-dark-layer-2 h-14 w-full">
      <div className="flex items-center text-white">
        <button className="flex cursor-pointer items-center rounded focus:outline-none bg-dark-fill-3 text-dark-label-2 hover:bg-dark-fill-2  px-2 py-1.5 font-medium">
          <div className="flex items-center px-1">
            <div className="text-xs text-label-2 dark:text-dark-label-2">
              JavaScript
            </div>
          </div>
        </button>
      </div>
      <div className="flex items-center">
        <VoiceAssistant/>
        <button className="preferenceBtn group">
          <div className="h-5 w-5 text-dark-gray-6 font-bold text-2xl m-1">
            <AiOutlineSetting />
          </div>
          <div className="preferenceBtn-tooltip">Settings</div>
        </button>

        <button className="preferenceBtn group">
          <div className="h-5 w-5 text-dark-gray-6 font-bold text-2xl m-1">
            <AiOutlineFullscreen />
          </div>
          <div className="preferenceBtn-tooltip">Full Screen</div>
        </button>
      </div>
    </div>
  );
};
export default PreferenceNav;
