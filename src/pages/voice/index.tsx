import React, { useEffect, useRef, useCallback, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools/index.js";
import { MdFiberManualRecord } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { WavPackerAudioType } from "@/lib/wavtools/lib/wav_packer";
import { GrConnect } from "react-icons/gr";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import { Button } from "@/components/Buttons/Button/Button";

import { X, Edit, Zap, ArrowUp, ArrowDown } from "react-feather";

import { isJsxOpeningLikeElement } from "typescript";
import { Toggle } from "@/components/Buttons/Toggle/Toggle";

type VoicePageProps = {};

const instructions = `System settings:
Tool use: enabled.

Instructions:
- You are an artificial intelligence agent responsible for helping test realtime voice capabilities
- Please make sure to respond with a helpful voice via audio
- Be kind, helpful, and curteous
- It is okay to ask the user questions
- Use tools and functions you have available liberally, it is part of the training apparatus
- Be open to exploration and conversation
- Remember: this is just for fun and testing!

Personality:
- Be upbeat and genuine
- Try speaking quickly as if excited
`;

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: "client" | "server";
  count?: number;
  event: { [key: string]: any };
}

const LOCAL_RELAY_SERVER_URL = "";

const VoicePage: React.FC<VoicePageProps> = () => {
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const startTimeRef = useRef<string>(new Date().toISOString());

  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + "";
      while (s.length < 2) {
        s = "0" + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // connect to audio output
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
      },
    ]);

    if (client.getTurnDetectionType() === "server_vad") {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);

    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.disconnect();
    await wavRecorder.end();
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);

    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();

    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => {
      client.appendInputAudio(data.mono);
    });
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);

    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;

    if (value === "none" && wavRecorder.getStatus() === "recording") {
      wavRecorder.pause();
    }

    client.updateSession({
      turn_detection: value === "none" ? null : { type: "server_vad" },
    });

    if (value === "server_vad" && client.isConnected()) {
      await wavRecorder.record((data) => {
        client.appendInputAudio(data.mono);
      });
    }

    setCanPushToTalk(value === "none");
  };

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: "whisper-1" } });

    // Add tools
    client.addTool(
      {
        name: "explain_code",
        description:
          "Explain the code stored in localStorage under the key 'code-two-sum'",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      async () => {
        const code = localStorage.getItem("code-two-sum");
        return code;
      }
    );

    // handle realtime events from client + server for event logging
    client.on("realtime.event", (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });

    client.on("error", (event: any) => console.error(event));

    client.on("conversation.interrupted", async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });

    client.on("conversation.updated", async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === "completed" && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  useEffect(() => {
    const code = localStorage.getItem("code-two-sum");
    console.log(code);
  }, []);

  return (
    <div data-component="ConsolePage">
      <div className="content-main">
        <div className="content-block conversation">
          <div className="content-block-body" data-conversation-content>
            {!items.length && `awaiting connection...`}
            {items.map((conversationItem, i) => {
              return (
                <div className="conversation-item" key={conversationItem.id}>
                  <div className={`speaker-content`}>
                    {conversationItem.formatted.file && (
                      <audio
                        src={conversationItem.formatted.file.url}
                        controls
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="content-actions">
          <Toggle
            defaultValue={false}
            labels={["manual", "vad"]}
            values={["none", "server_vad"]}
            onChange={(_, value) => changeTurnEndType(value)}
          />
          <div className="spacer" />
          {isConnected && canPushToTalk && (
            <Button
              label={isRecording ? "release to send" : "push to talk"}
              buttonStyle={isRecording ? "alert" : "regular"}
              disabled={!isConnected || !canPushToTalk}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
            />
          )}
          <div className="spacer" />
          <Button
            label={isConnected ? "disconnect" : "connect"}
            iconPosition={isConnected ? "end" : "start"}
            icon={isConnected ? X : Zap}
            buttonStyle={isConnected ? "regular" : "action"}
            onClick={isConnected ? disconnectConversation : connectConversation}
          />
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex h-screen bg-slate-700 justify-center items-center">
  //     <div className="content-block conversation">
  //       <div className="content-block-title">conversation</div>
  //       <div className="content-block-body" data-conversation-content>
  //         {!items.length && `awaiting connection...`}
  //         {items.map((conversationItem, i) => {
  //           return (
  //             <div className="conversation-item" key={conversationItem.id}>
  //               <div className={`speaker ${conversationItem.role || ""}`}>
  //                 <div>
  //                   {(
  //                     conversationItem.role || conversationItem.type
  //                   ).replaceAll("_", " ")}
  //                 </div>
  //                 <div
  //                   className="close"
  //                   onClick={() => deleteConversationItem(conversationItem.id)}
  //                 >
  //                   <X />
  //                 </div>
  //               </div>
  //               <div className={`speaker-content`}>
  //                 {/* tool response */}
  //                 {conversationItem.type === "function_call_output" && (
  //                   <div>{conversationItem.formatted.output}</div>
  //                 )}
  //                 {/* tool call */}
  //                 {!!conversationItem.formatted.tool && (
  //                   <div>
  //                     {conversationItem.formatted.tool.name}(
  //                     {conversationItem.formatted.tool.arguments})
  //                   </div>
  //                 )}
  //                 {!conversationItem.formatted.tool &&
  //                   conversationItem.role === "user" && (
  //                     <div>
  //                       {conversationItem.formatted.transcript ||
  //                         (conversationItem.formatted.audio?.length
  //                           ? "(awaiting transcript)"
  //                           : conversationItem.formatted.text || "(item sent)")}
  //                     </div>
  //                   )}
  //                 {!conversationItem.formatted.tool &&
  //                   conversationItem.role === "assistant" && (
  //                     <div>
  //                       {conversationItem.formatted.transcript ||
  //                         conversationItem.formatted.text ||
  //                         "(truncated)"}
  //                     </div>
  //                   )}
  //                 {conversationItem.formatted.file && (
  //                   <audio src={conversationItem.formatted.file.url} controls />
  //                 )}
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>

  //     {/* <FaPlay className="text-4xl" />
  //     <MdFiberManualRecord className="text-5xl" />
  //     <GrConnect className="text-3xl" /> */}
  //     <div>
  //       <Toggle
  //         defaultValue={false}
  //         labels={["manual", "vad"]}
  //         values={["none", "server_vad"]}
  //         onChange={(_, value) => changeTurnEndType(value)}
  //       />
  //       <div className="spacer" />
  //       {isConnected && canPushToTalk && (
  //         <Button
  //           label={isRecording ? "release to send" : "push to talk"}
  //           buttonStyle={isRecording ? "alert" : "regular"}
  //           disabled={!isConnected || !canPushToTalk}
  //           onMouseDown={startRecording}
  //           onMouseUp={stopRecording}
  //         />
  //       )}
  //       <div className="spacer" />
  //       <Button
  //         label={isConnected ? "disconnect" : "connect"}
  //         iconPosition={isConnected ? "end" : "start"}
  //         icon={isConnected ? X : Zap}
  //         buttonStyle={isConnected ? "regular" : "action"}
  //         onClick={isConnected ? disconnectConversation : connectConversation}
  //       />
  //     </div>
  //   </div>
  // );
};
export default VoicePage;
