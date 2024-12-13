import React, { useState } from "react";
import { RiVoiceprintLine } from "react-icons/ri";
import OpenAI from "openai";
import Voice from "../Voice/Voice";

type VoiceAssistantProps = {};

const VoiceAssistant: React.FC<VoiceAssistantProps> = () => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className="preferenceBtn group p-0 mr-0">
      <div className="text-gray-300 mr-4">
        <div className={`${showForm ? "absolute invisible" : ""}`}>
          <Voice />
        </div>
      </div>
      <div className="font-bold text-2xl text-gray-400">
        <RiVoiceprintLine className="my-2 mr-4" onClick={() => setShowForm(!showForm)} />
      </div>
      {showForm && (
        <div className="preferenceBtn-tooltip">Voice Assistance</div>
      )}
    </div>
  );
};
export default VoiceAssistant;
