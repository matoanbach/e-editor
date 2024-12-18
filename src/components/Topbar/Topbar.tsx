
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Logout from "../Logout/Logout";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { handleAuthCallback, loginUser } from "@/state/user/userSlice";
import { problems } from "@/utils/problems";
import { setCompilerOutput, setLoadingCompilerOutput, setProblem } from "@/state/editor/editorSlice";


type TopbarProps = {
  enabled: boolean
};

// Environment variables
const AUTHN_HEADER = process.env.NEXT_PUBLIC_AUTHN_HEADER || "X-Auth-Token";
const AUTHN_TOKEN = process.env.NEXT_PUBLIC_AUTHN_TOKEN || "";
const AUTHZ_HEADER = process.env.NEXT_PUBLIC_AUTHZ_HEADER || "X-Auth-User";
const AUTHZ_TOKEN = process.env.NEXT_PUBLIC_AUTHZ_TOKEN || "";
const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || "";

const Topbar: React.FC<TopbarProps> = ({ enabled }) => {
  // Use auth0 to handle authentication
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, email, picture } = useSelector((state: RootState) => state.userSlice)
  const { compilerOutput } = useSelector((state: RootState) => state.editorSlice)
  const { codeEditor } = useSelector((state: RootState) => state.editorSlice)

  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0)
  const problemKeys = Object.keys(problems);

  const handleLogin = () => {
    dispatch(loginUser())
  }

  const handleNextProblem = () => {
    setCurrentProblemIndex((prevIndex) => {
      return prevIndex < problemKeys.length - 1 ? prevIndex + 1 : 0
    })
  }

  const handlePreviousProblem = () => {
    setCurrentProblemIndex((prevIndex) => {
      return prevIndex > 0 ? prevIndex - 1 : problemKeys.length - 1
    })
  }

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
      alert(error.message);
      dispatch(setCompilerOutput(`Error: ${error}`));
    } finally {
      dispatch(setLoadingCompilerOutput(false));
    }
  };

  useEffect(() => {
    if (window.location.search.includes("code=")) {
      dispatch(handleAuthCallback())
    }
  }, [dispatch])

  useEffect(() => {
    const problem = problems[problemKeys[currentProblemIndex]];
    dispatch(setProblem(problem));
  }, [currentProblemIndex])
  return (
    <nav className="relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-2 text-dark-gray-7">
      <div
        className={`flex w-full items-center justify-between`}
      >
        <Link href="/" className="h-[22px] flex-1">
          <img src="/logo-full.png" alt="Logo" className="h-full" />
        </Link>
        {enabled &&
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer" onClick={handlePreviousProblem}
            >
              <FaChevronLeft />
            </div>
            {/* Submit Button */}
            <div >
              <button
                onClick={handleSubmit}
                disabled={compilerOutput.loading || !isAuthenticated}
                className={`preferenceBtn group text-white m-0 bg-green-500 rounded hover:bg-green-700 transition duration-200 ${compilerOutput.loading ? "opacity-60 cursor-not-allowed " : ""
                  }`}
              >
                <div className="flex justify-center items-center gap-1 h-5 select-none">
                  {compilerOutput.loading ? "Running..." : <>
                    <FaPlay />
                    <p>Run</p>
                  </>
                  }
                </div>
                {!isAuthenticated && <div className="preferenceBtn-tooltip left-1">Please sign in</div>}
              </button>
            </div>
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer" onClick={handleNextProblem}
            >
              <FaChevronRight />
            </div>
          </div>
        }
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {!isAuthenticated && (
            <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded select-none" onClick={handleLogin}>
              Sign In
            </button>
          )}

          {isAuthenticated && (
            <div className="cursor-pointer group relative">
              <img
                src={picture!}
                alt="user profile img"
                className="h-8 w-8 rounded-full"
              />

              <div className="absolute top-10 left-2/4 -translate-x-2/4 mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm">{email}</p>
              </div>
            </div>
          )}
          {isAuthenticated && <Logout />}

        </div>

      </div >

    </nav >
  );
};
export default Topbar;
