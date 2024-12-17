import { setCompilerOutput, setLoadingCompilerOutput } from "@/state/editor/editorSlice";
import { AppDispatch, RootState } from "@/state/store";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type CompilerProps = {};

// Replace with your actual tokens
const AUTHN_HEADER = process.env.NEXT_PUBLIC_AUTHN_HEADER;
const AUTHN_TOKEN = process.env.NEXT_PUBLIC_AUTHN_TOKEN;
const AUTHZ_HEADER = process.env.NEXT_PUBLIC_AUTHZ_HEADER;
const AUTHZ_TOKEN = process.env.NEXT_PUBLIC_AUTHZ_TOKEN;
const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL;

const Compiler: React.FC<CompilerProps> = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.userSlice)
    const { codeEditor } = useSelector((state: RootState) => state.editorSlice)
    const { compilerOutput } = useSelector((state: RootState) => state.editorSlice)
    const dispatch = useDispatch<AppDispatch>()

    const handleSubmit = async () => {
        dispatch(setLoadingCompilerOutput(true));
        dispatch(setCompilerOutput("")); // Reset output

        if (!AUTHN_TOKEN || !AUTHZ_TOKEN || !JUDGE0_URL) {
            console.error("Missing configuration or tokens!");
            dispatch(setLoadingCompilerOutput(false));
            return;
        }

        try {
            // 1. Submit the code to Judge0
            // Note: Adjust language_id as needed.
            const submissionResponse = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&fields=*`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [AUTHN_HEADER as string]: AUTHN_TOKEN,
                    [AUTHZ_HEADER as string]: AUTHZ_TOKEN
                },
                body: JSON.stringify({
                    source_code: codeEditor.content,
                    language_id: 71, // Python 3
                    // You can add stdin, expected_output, etc. if needed.
                }),
            });

            if (!submissionResponse.ok) {
                throw new Error("Failed to create submission");
            }

            const { token } = await submissionResponse.json();

            // 2. Poll for result
            let attempts = 0;
            const maxAttempts = 10; // Just an example, adjust as necessary.
            let resultData = null;

            while (attempts < maxAttempts) {
                const resultResponse = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=*`, {
                    method: "GET",
                    headers: {
                        [AUTHN_HEADER as string]: AUTHN_TOKEN,
                        [AUTHZ_HEADER as string]: AUTHZ_TOKEN
                    },
                });

                if (!resultResponse.ok) {
                    throw new Error("Failed to fetch submission result");
                }

                resultData = await resultResponse.json();
                // Check if result is ready
                // status.id > 2 usually means done. Status codes:
                // 1: In Queue, 2: Processing, >2: Finished.
                if (resultData && resultData.status && resultData.status.id > 2) {
                    break;
                }

                // Wait a bit before next attempt
                await new Promise((resolve) => setTimeout(resolve, 1000));
                attempts++;
            }

            if (resultData) {
                // resultData may contain `stdout`, `stderr`, `compile_output`, and `message`.
                // stdout is what we want if the code ran successfully.
                if (resultData.stdout) {
                    dispatch(setCompilerOutput(resultData.stdout));
                } else if (resultData.stderr) {
                    dispatch(setCompilerOutput(resultData.stderr));
                } else if (resultData.compile_output) {
                    dispatch(setCompilerOutput(resultData.compile_output));
                } else if (resultData.message) {
                    dispatch(setCompilerOutput(resultData.message));
                } else {
                    dispatch(setCompilerOutput("No output received. Check your code or server logs."));
                }
            } else {
                dispatch(setCompilerOutput("Result not received in a timely manner."));
            }
        } catch (error: any) {
            console.error("Error:", error);
            dispatch(setCompilerOutput(`Error: ${error.message}`));
        } finally {
            dispatch(setLoadingCompilerOutput(false));
        }
    };

    useEffect(() => {
        localStorage.setItem("compiler-output", compilerOutput.content)
    }, [compilerOutput])
    
    return (
        <div className="w-full h-full mx-auto p-3 bg-dark-layer-2 rounded-lg shadow-lg text-gray-100 font-mono">

            {/* Submit Button */}
            {/* <div >
                <button
                    onClick={handleSubmit}
                    disabled={compilerOutput.loading || !isAuthenticated}
                    className={`preferenceBtn group px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition duration-200 ${compilerOutput.loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {compilerOutput.loading ? "Running..." : "Run Code"}
                    {!isAuthenticated && <div className="preferenceBtn-tooltip left-1">Please sign in</div>}
                </button>
            </div> */}
      <div>
        <h1 className="text-white-400 text-lg font-bold">Output</h1>
      </div>
            {/* Output Section */}
            <div className="mt-3">
                <div
                    className="w-full mt-2 h-auto bg-dark-layer-2 text-gray-200 p-3 rounded border border-gray-700 overflow-auto whitespace-pre"
                    style={{ fontFamily: "monospace" }}
                >
                    {compilerOutput.content|| "No output yet..."}
                </div>
            </div>
        </div>
    );
};

export default Compiler;
