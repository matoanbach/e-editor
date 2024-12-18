import React, { useRef, useCallback, useState } from "react";
import { WavRecorder, WavStreamPlayer } from "@/lib/wavtools/index.js";
import { RealtimeClient } from "@openai/realtime-api-beta";
import OpenAI from "openai";
import TemporaryToggle from "@/components/Buttons/TemporaryToggle/TemporaryToggle";
import TemporaryButton from "@/components/Buttons/TemporaryButton/TemporaryButton";
import APIRequestForm from "@/components/Buttons/APIRequestForm/APIRequestForm";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { setCodeContent, setDescriptionContent, setHighlighCode, setHighlighDecription } from "@/state/editor/editorSlice";


const instructions = `
  System Settings:
- Tool usage: enabled.
- Access to the code editor: enabled for reading and editing.
- Access to the problem description editor: enabled for reading and editing.

Instructions:
- You are an intelligent assistant designed to help the user interact with their code editor and problem description editor in real-time.
- Your responsibilities include:
  1. **Proactively monitoring** the code and description editors to stay updated on changes.
  2. Fetching the current code or description upon user request.
  3. Updating the code or description as instructed by the user, ensuring all updates are valid and accurately reflect the request.
  4. Providing meaningful suggestions or explanations based on the current content in the editors.

Tool Usage:
1. **read_code**:
   - Use this tool to fetch and display the current content of the code editor.
   - Validate that the fetched code is the most recent version.
   - If the code editor is empty, notify the user that no code is available.

2. **read_description**:
   - Use this tool to fetch and display the current problem description from the editor.
   - Validate that the fetched description is the most recent version.
   - If the description editor is empty, notify the user that no description is available.

3. **change_code**:
   - Use this tool to replace the existing code in the editor with new code provided by the user or suggested by you.
   - Validate that the newCode parameter is not empty before attempting to update the editor.
   - Confirm the update by notifying the user that the code has been successfully updated.
   - If the update fails, provide a clear and actionable error message.

4. **change_description**:
   - Use this tool to replace the current problem description in the editor with a new description provided by the user or suggested by you.
   - Validate that the newDescription parameter is not empty before attempting to update the editor.
   - Confirm the update by notifying the user that the description has been successfully updated.
   - If the update fails, provide a clear and actionable error message.

5. **highlight**:
   - Use this tool to enable or disable highlighting for a specified range of lines in a given editor.
   - Parameters:
     - editorType (string): The type of the editor in which to apply the highlighting. Must be either 'description-editor' or 'coding-editor'.
     - enabledHighlight (boolean): A boolean flag indicating whether to enable (true) or disable (false) the highlighting effect.
     - fromLine (number): The starting line number to highlight (inclusive).
     - toLine (number): The ending line number to highlight (inclusive).
   - Validate that editorType, enabledHighlight, fromLine, and toLine are provided.
   - If enabledHighlight is true, highlight the specified range of lines. If false, remove any existing highlight.
   - Confirm the action by notifying the user that the highlight has been successfully updated.
   - If the operation fails, provide a clear and actionable error message.

Behavior and Personality:
- Maintain a friendly, courteous, and professional tone at all times.
- Be proactive in assisting the user by monitoring and understanding the content of the editors.
- Use concise and conversational language, adapting to the user's needs while ensuring your responses are helpful and accurate.
- **Speak at a faster pace to maintain an engaging and dynamic interaction.** Avoid unnecessary pauses while delivering information clearly and quickly.

Guidelines for Code and Description Editing:
- Proactively monitor the editors using the read_code and read_description tools, but avoid making changes unless explicitly requested by the user.
- When suggesting changes, clearly explain the reasoning and how the new content improves the user’s solution or understanding.
- Validate all updates made using the change_code or change_description tools to ensure they align with the user’s request and editor state.
- Encourage user feedback on changes to ensure satisfaction and continued collaboration.

Additional Notes:
- Regularly validate that the read_code and read_description tools fetch the correct and most recent state of the editors.
- Avoid making assumptions about the code or description unless explicitly requested by the user.
- Be open to experimentation and create a collaborative environment where users feel comfortable exploring, asking questions, and modifying content.
- Foster seamless integration between your assistance and the user’s workflow, ensuring minimal disruption and maximum utility.
`;

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
      console.log(response.choices[0].message.content);
      console.log("API key is valid!");
      // setValidAPIKey(true);

      clientRef.current = new RealtimeClient({
        apiKey: inputs.apikey,
        dangerouslyAllowAPIKeyInBrowser: true,
      });
      connectConversation();
      setup();
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
    client.updateSession({ instructions: instructions });
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
        return code;
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
        return description;
      }
    );

    // Tool to update the code in the editor
    client.addTool(
      {
        name: "change_code",
        description: "Update the code in the editor with a new version",
        parameters: {
          type: "object",
          properties: {
            newCode: {
              type: "string",
              description:
                "The new code to replace the current code in the editor",
            }
          },
          required: ["newCode", "fromLine", "toLine"],
        },
      },
      async ({
        newCode
      }: {
        newCode: string;
        fromLine: number;
        toLine: number;
      }) => {
        if (!newCode) {
          return "Failed to update code: No new code provided.";
        }
        dispatch(setCodeContent(newCode))
        return "Code successfully updated in the editor.";
      }
    );

    // Tool to update the problem description in the editor
    client.addTool(
      {
        name: "change_description",
        description: "Update the problem description in the editor",
        parameters: {
          type: "object",
          properties: {
            newDescription: {
              type: "string",
              description:
                "The new description to replace the current problem description in the editor",
            },
          },
          required: ["newDescription"],
        },
      },
      async ({ newDescription }: { newDescription: string }) => {
        if (!newDescription) {
          return "Failed to update description: No new description provided.";
        }
        dispatch(setDescriptionContent(newDescription));
        return "Description successfully updated in the editor.";
      }
    );

    // Tool to update the problem description in the editor
    client.addTool(
      {
        name: "highlight",
        description:
          "Highlight a specified range of lines in the given editor.",
        parameters: {
          type: "object",
          properties: {
            editorType: {
              type: "string",
              description:
                "The type of editor in which to apply the highlighting. Must be either 'description-editor' or 'coding-editor'.",
            },
            enabledHighlight: {
              type: "boolean",
              description:
                "A boolean flag indicating whether to enable or disable the highlighting effect. Set to 'true' to turn on highlighting for the specified range, or 'false' to remove any existing highlights.",
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
          required: ["editorType", "enabledHighlight", "fromLine", "toLine"],
        },
      },

      async ({
        editorType,
        fromLine,
        toLine,
        enabledHighlight,
      }: {
        editorType: string;
        fromLine: number;
        toLine: number;
        enabledHighlight: boolean;
      }) => {
        if (!editorType) {
          return "Failed to highlight.";
        }
        if (editorType === "coding-editor") {
          dispatch(setHighlighCode({
            enabled: enabledHighlight,
            from: fromLine,
            to: toLine,
          }))
          // setUserCode((prev) => ({
          //   ...prev,
          //   codeEditor: {
          //     ...prev.codeEditor,
          //     highlightCode: {
          //       ...prev.codeEditor.highlightCode,
          //       enabled: enabledHighlight,
          //       from: fromLine,
          //       to: toLine,
          //     }, // or just use from/to directly
          //   },
          // }));
        } else {
          dispatch(setHighlighDecription({
            enabled: enabledHighlight,
            from: fromLine,
            to: toLine,
          }));
          // setUserCode((prev) => ({
          //   ...prev,
          //   descriptionEditor: {
          //     ...prev.descriptionEditor,
          //     highlightDescription: {
          //       ...prev.descriptionEditor.highlightDescription,
          //       enabled: enabledHighlight,
          //       from: fromLine,
          //       to: toLine,
          //     }, // or just use from/to directly
          //   },
          // }));
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
  //   console.log(localStorage.getItem("coding-editor"))
  // }, [codeEditor]);

  // useEffect(() => {
  //   console.log(localStorage.getItem("description-editor"))
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
