import { RootState } from "@/state/store";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const Compiler: React.FC = () => {
    const { compilerOutput } = useSelector((state: RootState) => state.editorSlice)

    useEffect(() => {
        localStorage.setItem("compiler-output", compilerOutput.content)
    }, [compilerOutput])

    return (
        <div className="w-full h-full mx-auto p-3 bg-dark-layer-2 rounded-lg shadow-lg text-gray-100 font-mono">
            <div>
                <h1 className="text-white-400 text-lg font-bold">Output</h1>
            </div>
            {/* Output Section */}
            <div className="mt-3">
                <div
                    className="w-full mt-2 h-auto bg-dark-layer-2 text-gray-200 p-3 rounded border border-gray-700 overflow-auto whitespace-pre"
                    style={{ fontFamily: "monospace" }}
                >
                    {compilerOutput.content || "No output yet..."}
                </div>
            </div>
        </div>
    );
};

export default Compiler;
