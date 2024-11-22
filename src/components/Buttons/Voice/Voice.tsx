import React, { useEffect, useRef, useCallback, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools/index.js";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { ItemType } from "@openai/realtime-api-beta/dist/lib/client.js";
import TemporaryToggle from "../TemporaryToggle/TemporaryToggle";
import TemporaryButton from "../TemporaryButton/TemporaryButton";
import APIRequestForm from "../APIRequestForm/APIRequestForm";
import OpenAI from "openai";
import { userCodeState } from "@/atoms/userCodeAtom";
import { snapshot_UNSTABLE, useRecoilState, useRecoilValue } from "recoil";

type VoicePageProps = {};

const instructions = `
System Settings:
- Tool usage: enabled.
- Access to code editor: enabled for reading and editing.

Instructions:
- You are an intelligent assistant tasked with helping the user interact with their code editor in real-time.
- Your primary tasks include:
  1. Reading the code in the editor using the "read_code" tool when requested.
  2. Editing the code in the editor by replacing it with new code using the "change_code" tool when instructed.

Tool Usage:
1. **read_code**:
   - Use this tool to fetch and display the current content of the code editor.
   - Ensure you present the code clearly, maintaining formatting for readability.
   - Do not make assumptions about the code unless explicitly asked.

2. **change_code**:
   - Use this tool to replace the existing code in the editor with new code provided by the user or suggested by you.
   - Ensure the new code is valid and relevant to the user’s request.
   - Confirm the changes by informing the user that the code has been updated.
   - If the new code is invalid or missing, provide an appropriate error message.

Behavior and Personality:
- Maintain a kind, courteous, and professional tone at all times.
- Be proactive in assisting the user, offering suggestions or clarifications when necessary.
- Use conversational language and adapt to the user's needs while ensuring your responses are concise and helpful.
- Be collaborative, and explain your reasoning when suggesting edits or improvements to the code.

Guidelines for Code Editing:
- Only edit the code if explicitly requested by the user.
- When suggesting changes, explain the reason behind the modification and how it improves the code.
- Preserve the original intent and structure of the user's code unless a complete replacement is requested.
- Ensure the user is informed of the changes and confirm that they are satisfied with the result.

Additional Notes:
- Always validate that the new code provided to the "change_code" tool is not empty before attempting to update the editor.
- Be open to experimentation and foster a collaborative environment where users feel comfortable exploring and modifying code.
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

const VoicePage: React.FC<VoicePageProps> = () => {
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient | null>(null);

  const [userCodeModal, setUserCode] = useRecoilState(userCodeState);

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

  const [inputs, setInputs] = useState({ apikey: "" });
  const [validAPIKey, setValidAPIKey] = useState<boolean>(false);

  /**
   * Promp users for their OPEN API KEY
   **/
  const handleSubmitAPI = async () => {
    // handle the submit form
    try {
      const apiKey = inputs.apikey;
      if (apiKey === "") return;

      const openai = new OpenAI({
        apiKey: inputs.apikey,
        dangerouslyAllowBrowser: true,
      });
      // Make a simple API request to validate the API key
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Just say "roger" if you can read this message`,
          },
        ],
      });
      console.log(response.choices[0].message.content);
      console.log("API key is valid!");
      setValidAPIKey(true);

      clientRef.current = new RealtimeClient({
        apiKey: inputs.apikey,
        dangerouslyAllowAPIKeyInBrowser: true,
      });
      connectConversation();
      setup();
    } catch (error: any) {
      alert("Invalid API key. Please try again.");
      setValidAPIKey(false);
    }
  };

  /**
   * Handle any change in the form to request api key
   */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    if (!clientRef.current) return;

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
    if (!clientRef.current) return;
    setValidAPIKey(false);
    setInputs((prev) => ({ ...prev, apikey: "" }));

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
    if (!clientRef.current) return;
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    if (!clientRef.current) return;
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
    if (!clientRef.current) return;
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
    if (!clientRef.current) return;
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
    console.log(value, "canPushToTalk: ", value === "none");
  };

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  const setup = () => {
    if (!clientRef.current) return;
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: "whisper-1" } });

    // Explain code functionality
    client.addTool(
      {
        name: "read_code",
        description: "Read the code in the editor",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      async () => {
        const code = localStorage.getItem("coding-editor");
        return code;
      }
    );
    // Change the code functionality
    client.addTool(
      {
        name: "change_code",
        description:
          "Change the code as needed by replacing it with a whole new code",
        parameters: {
          type: "object",
          properties: {
            newCode: {
              type: "string",
              description:
                "The new code to replace the existing code in the code editor",
            },
          },
          required: ["newCode"],
        },
      },
      async ({ newCode }: { newCode: string }) => {
        if (!newCode) {
          return "Code unsuccessfully udpated in the code editor"
        }
        setUserCode((prev) => ({ ...prev, userCode: newCode })); // Replace the code in localStorage
        return "Code successfully updated in localStorage.";
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
  };

  useEffect(() => {
    const code = localStorage.getItem("coding-editor"); // Retrieve from localStorage
    console.log(code)
  }, [userCodeModal]);

  return (
    <div className="flex items-center gap-4">
      {isConnected && (
        <TemporaryToggle
          defaultValue={false}
          labels={["Manual", "Vad"]}
          values={["none", "server_vad"]}
          onChange={(_, value) => changeTurnEndType(value)}
        />
      )}
      {isConnected && canPushToTalk && (
        <div onMouseDown={startRecording} onMouseUp={stopRecording}>
          <TemporaryButton
            label={isRecording ? "Release to send" : "Push to talk"}
            disabledBttn={!canPushToTalk}
          />
        </div>
      )}
      {/* Promp users for their OPEN API KEY*/}
      {!isConnected && <APIRequestForm handleChange={handleChange} />}
      <div onClick={isConnected ? disconnectConversation : handleSubmitAPI}>
        <TemporaryButton label={isConnected ? "Disconnect" : "Connect"} />
      </div>
    </div>
  );
};
export default VoicePage;
