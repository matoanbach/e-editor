import React, { useState } from "react";
import { RiVoiceprintLine } from "react-icons/ri";
import Voice from "../Voice/Voice";


const VoiceAssistant: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);

  return (
    <div className="preferenceBtn group mr-0">
      <div className="text-gray-300">
        <div className={`${showForm ? "absolute invisible" : "mr-3"}`}>
          <Voice />
        </div>
      </div>
      <div className="font-bold text-2xl text-gray-300 flex items-center">
        <RiVoiceprintLine onClick={() => setShowForm(!showForm)} />
      </div>
      {showForm && (
        <div className="preferenceBtn-tooltip">Voice Assistance</div>
      )}
    </div>
  );
};
export default VoiceAssistant;
