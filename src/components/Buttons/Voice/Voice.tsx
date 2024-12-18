import React, { useRef, useCallback, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools/index.js";
import { RealtimeClient } from "@openai/realtime-api-beta";
import OpenAI from "openai";
import TemporaryToggle from "@/components/Buttons/TemporaryToggle/TemporaryToggle";
import TemporaryButton from "@/components/Buttons/TemporaryButton/TemporaryButton";
import APIRequestForm from "@/components/Buttons/APIRequestForm/APIRequestForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { insertCode, insertDescription, setHighlighCode, setHighlighDecription } from "@/state/editor/editorSlice";
import { construct_instructions } from "@/utils/prompts/instructions";


/**
 * Type for all event logs
 */
// interface RealtimeEvent {
//   time: string;
//   source: "client" | "server";
//   count?: number;
//   event: { [key: string]: any };
// }

const VoicePage: React.FC = () => {
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient | null>(null);

  const { problem } = useSelector((state: RootState) => state.editorSlice)
  const dispatch = useDispatch<AppDispatch>()
  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const startTimeRef = useRef<string>(new Date().toISOString());

  // const [items, setItems] = useState<ItemType[]>([]);
  // const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  // const [expandedEvents, setExpandedEvents] = useState<{
  //   [key: string]: boolean;
  // }>({});

  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const [inputs, setInputs] = useState({ apikey: "" });
  // const [validAPIKey, setValidAPIKey] = useState<boolean>(false);

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
      console.log("API key is valid! response: ", response.choices[0].message);
      // setValidAPIKey(true);

      clientRef.current = new RealtimeClient({
        apiKey: inputs.apikey,
        dangerouslyAllowAPIKeyInBrowser: true,
      });
      setup();
      connectConversation();
    } catch (error: any) {
      alert(error.message);
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
    // setRealtimeEvents([]);
    // setItems(client.conversation.getItems());

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
    // setValidAPIKey(false);
    setInputs((prev) => ({ ...prev, apikey: "" }));

    setIsConnected(false);
    // setRealtimeEvents([]);
    // setItems([]);

    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.disconnect();
    await wavRecorder.end();
    await wavStreamPlayer.interrupt();
  }, []);

  // const deleteConversationItem = useCallback(async (id: string) => {
  //   if (!clientRef.current) return;
  //   const client = clientRef.current;
  //   client.deleteItem(id);
  // }, []);

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
    client.updateSession({ instructions: construct_instructions(problem) });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: "whisper-1" } });

    // Tool to read the code from the editor
    client.addTool(
      {
        name: "read_code",
        description: "Read the current code in the coding editor",
        parameters: {
          type: "object",
          properties: {}, // No parameters required for this tool
        },
      },
      async () => {
        const code = localStorage.getItem("coding-editor");
        if (!code) {
          return "No code found in the editor.";
        }
        const codeWithLineNumbers = code.split("\n").map((line, index) => `${index + 1}: ${line}`).join("\n")
        return codeWithLineNumbers;
      }
    );

    // Tool to read the problem description
    client.addTool(
      {
        name: "read_description",
        description: "Read the problem description from the description editor",
        parameters: {
          type: "object",
          properties: {}, // No parameters required for this tool
        },
      },
      async () => {
        const description = localStorage.getItem("description-editor");
        if (!description) {
          return "No description found in the editor.";
        }
        const descriptionWithLineNumbers = description.split("\n").map((line, index) => `${index + 1}: ${line}`).join("\n")
        return descriptionWithLineNumbers;
      }
    );

    // Tool to update the code in the editor
    client.addTool(
      {
        name: "change_code",
        description: "Replace or insert code in the coding editor",
        parameters: {
          type: "object",
          properties: {
            newCode: {
              type: "string",
              description: "The new code to insert or replace in the coding editor",
            },
            startLine: {
              type: "number",
              description: "The starting line number for the operation (inclusive).",
            },
            endLine: {
              type: "number",
              description:
                "The ending line number for replacement (inclusive). Optional for insertion.",
            },
          },
          required: ["newCode", "startLine"],
        },
      },
      async ({
        newCode,
        fromLine,
        toLine,
      }: {
        newCode: string;
        fromLine: number;
        toLine?: number;
      }) => {
        if (!newCode) {
          return "Failed to update code: No new code provided.";
        }

        // Update the code in the editor
        // Update the problem description in the editor
        dispatch(insertCode({
          content: newCode,
          from: fromLine,
          to: toLine || null,
        }));
        return "Code successfully updated in the editor.";
      }
    );

    // Tool to update the problem description in the editor
    client.addTool(
      {
        name: "change_description",
        description: "Replace or insert the problem description in the editor",
        parameters: {
          type: "object",
          properties: {
            newDescription: {
              type: "string",
              description:
                "The new description to replace the current problem description in the editor",
            },
            fromLine: {
              type: "number",
              description: "The starting line number of the change (inclusive).",
            },
            toLine: {
              type: "number",
              description: "The ending line number of the change (inclusive).",
            },
          },
          required: ["newDescription", "fromLine", "toLine"],
        },
      },
      async ({
        newDescription,
        fromLine,
        toLine,
      }: {
        newDescription: string;
        fromLine: number;
        toLine: number;
      }) => {
        if (!newDescription) {
          return "Failed to update description: No new description provided.";
        }

        // Update the problem description in the editor
        dispatch(insertDescription({
          content: newDescription,
          from: fromLine,
          to: toLine || null,
        }));
        return "Description successfully updated in the editor.";
      }
    );

    // Tool to highlight the problem description in the editor
    client.addTool(
      {
        name: "highlight",
        description: "Highlight a specified range of lines in the given editor.",
        parameters: {
          type: "object",
          properties: {
            editorType: {
              type: "string",
              description:
                "The type of editor in which to apply the highlighting. Must be either 'description-editor' or 'coding-editor'.",
            },
            fromLine: {
              type: "number",
              description: "The starting line number to highlight (inclusive).",
            },
            toLine: {
              type: "number",
              description: "The ending line number to highlight (inclusive).",
            },
          },
          required: ["editorType", "fromLine", "toLine"],
        },
      },
      async ({
        editorType,
        fromLine,
        toLine,
      }: {
        editorType: string;
        fromLine: number;
        toLine: number;
      }) => {
        if (!editorType) {
          return "Failed to highlight: editor type is missing.";
        }

        if (editorType === "coding-editor") {
          dispatch(
            setHighlighCode({
              from: fromLine,
              to: toLine,
            })
          );
        } else if (editorType === "description-editor") {
          dispatch(
            setHighlighDecription({
              from: fromLine,
              to: toLine,
            })
          );
        } else {
          return "Failed to highlight: unknown editor type.";
        }
        return "Successfully highlighted.";
      }
    );


    // handle realtime events from client + server for event logging
    // client.on("realtime.event", (realtimeEvent: RealtimeEvent) => {
    //   setRealtimeEvents((realtimeEvents) => {
    //     const lastEvent = realtimeEvents[realtimeEvents.length - 1];
    //     if (lastEvent?.event.type === realtimeEvent.event.type) {
    //       // if we receive multiple events in a row, aggregate them for display purposes
    //       lastEvent.count = (lastEvent.count || 0) + 1;
    //       return realtimeEvents.slice(0, -1).concat(lastEvent);
    //     } else {
    //       return realtimeEvents.concat(realtimeEvent);
    //     }
    //   });
    // });

    client.on("error", (event: unknown) => console.error(event));

    client.on("conversation.interrupted", async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.on("conversation.updated", async ({ item, delta }: any) => {
      // const items = client.conversation.getItems();
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
      // setItems(items);
    });

    // setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  };

  // useEffect(() => {
  //   const code = localStorage.getItem("coding-editor");

  //   if (!code) {
  //     console.log("No code found in localStorage.");
  //     return;
  //   }

  //   const lines = code.split("\n"); // Split code into lines

  //   const codeWithLineNumbers = lines
  //     .map((line, index) => `${index + 1}: ${line}`) // Prepend each line with its line number
  //     .join("\n"); // Join lines back with newlines

  //   console.log("Code with line numbers:");
  //   console.log(codeWithLineNumbers);
  // }, [codeEditor]);

  // useEffect(() => {
  //   const description = localStorage.getItem("description-editor")

  //   if (!description) {
  //     console.log("No code found in localStorage.");
  //     return;
  //   }

  //   const lines = description.split("\n"); // Split code into lines

  //   const descriptionWithLineNumbers = lines
  //     .map((line, index) => `${index + 1}: ${line}`) // Prepend each line with its line number
  //     .join("\n"); // Join lines back with newlines

  //   console.log("Code with line numbers:");
  //   console.log(descriptionWithLineNumbers);
  // }, [descriptionEditor]);

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
