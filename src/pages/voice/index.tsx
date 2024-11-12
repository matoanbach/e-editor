import React, { useCallback, useEffect, useRef, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools/index.js";
import { MdFiberManualRecord } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { WavPackerAudioType } from "@/lib/wavtools/lib/wav_packer";
import { GrConnect } from "react-icons/gr";

type VoicePageProps = {};

const VoicePage: React.FC<VoicePageProps> = () => {
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );

  const [audio, setAudio] = useState<Int16Array>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectConversation = async () => {
    setIsConnected(true);
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();
  };

  const disconnectConversation = async () => {
    setIsConnected(false);
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  };

  const startRecording = async () => {
    setIsRecording(true);
    // const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();

    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      // await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => setAudio(data.mono));
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
  };

  const startPlaying = async () => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    wavStreamPlayer.add16BitPCM(audio, "my-track");
  };

  const stopPlaying = async () => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  };

  return (
    <div className="flex justify-center items-center">
      <FaPlay className="text-4xl" />
      <MdFiberManualRecord
        className="text-5xl"
        onClick={isRecording ? stopRecording : startRecording}
      />
      <GrConnect
        onClick={isConnected ? disconnectConversation : connectConversation}
      />
      {audio && (
        <div>
          <p>
            {audio.length}
          </p>
        </div>
      )}
    </div>
  );
};
export default VoicePage;
