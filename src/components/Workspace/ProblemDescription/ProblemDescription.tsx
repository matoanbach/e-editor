import { Problem } from "@/utils/types/problem";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline } from "react-icons/ti";
import CodeMirror from "@uiw/react-codemirror";
import PreferenceNav from "../Playground/PreferenceNav/PreferenceNav";
import Split from "react-split";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import EditorFooter from "../Playground/EditorFooter";

type ProblemDescriptionProps = {
  problem: Problem;
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  return (
    <div className="flex flex-col bg-dark-layer-1 relative overflow-x-hidden">
      <PreferenceNav />
      <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
      >
        <div className="w-full">
          <CodeMirror
            value={""}
            theme={vscodeDark}
            // extensions={[markdown()]}
            style={{ fontSize: 16 }}
            // onChange={handleCodeChange}
          />
        </div>
        {/* test case heading */}
        <div className="w-full px-5 overflow-auto">
          <div className="flex h-10 items-center space-x-6">
            <div className="relative flex h-full flex-col justify-center cursor-pointer">
              <div className="text-sm font-medium leading-5 text-white">
                Test Cases
              </div>
              <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
            </div>
          </div>
          <div className="flex">
            {problem.examples.map((example, index) => {
              return (
                <div
                  className="mr-2 items-start mt-2 text-white"
                  // onClick={() => setActiveTestCaseId(index)}
                  key={index}
                >
                  <div className="flex flex-wrap items-center gap-y-4">
                    <div
                      className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3
                hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
                `}
                    >
                      Case {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="font-semibold my-4">
            <p className="text-sm font-medium mt-4 text-white">Input:</p>
            <div className="2-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2"></div>
            <p className="text-sm font-medium mt-4 text-white">Output:</p>
            <div className="2-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2"></div>
          </div>
        </div>
      </Split>
      <EditorFooter />
    </div>
  );
  // return (
  //   <div className="bg-dark-layer-1">
  //     {/* TAB */}
  //     <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden">
  //       <div
  //         className={
  //           "bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"
  //         }
  //       >
  //         Description
  //       </div>
  //     </div>

  //     {/* Problem heading */}
  //     <div className="flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto">
  //       <div className="px-5">
  //         <div className="w-full">
  //           <div className="flex space-x-4">
  //             <div className="flex-1 mr-2 text-lg text-white font-medium">
  //               {problem.title}
  //             </div>
  //           </div>
  //           <div className="flex items-center mt-3">
  //             <div
  //               className={`text-olive bg-olive inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
  //             >
  //               Easy
  //             </div>
  //             <div className="rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s">
  //               <BsCheck2Circle />
  //             </div>
  //             <div className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6">
  //               <AiFillLike />
  //               <span className="text-xs">120</span>
  //             </div>
  //             <div className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6">
  //               <AiFillDislike />
  //               <span className="text-xs">2</span>
  //             </div>
  //             <div className="cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 ">
  //               <TiStarOutline />
  //             </div>
  //           </div>

  //           <div className="text-white text-sm">
  //             <div
  //               dangerouslySetInnerHTML={{ __html: problem.problemStatement }}
  //             />
  //           </div>

  //           <div className="mt-4">
  //             {problem.examples.map((example, index) => {
  //               return (
  //                 <div key={index}>
  //                   <p className="font-medium text-white ">{`Example ${
  //                     index + 1
  //                   }: `}</p>
  //                   {example.img && (
  //                     <img src={example.img} alt="" className="mt-4" />
  //                   )}
  //                   <div className="example-card">
  //                     <pre>
  //                       <strong className="text-white">Input: </strong>{" "}
  //                       {example.inputText} <br />
  //                       <strong>Output:</strong> {example.outputText} <br />
  //                       {example.explanation && (
  //                         <>
  //                           <strong>Explanation:</strong> {example.explanation}
  //                         </>
  //                       )}
  //                     </pre>
  //                   </div>
  //                 </div>
  //               );
  //             })}
  //           </div>
  //           <div className="my-8 pb-2">
  //             <div className="text-white text-sm font-medium">Constraints:</div>
  //             <ul className="text-white ml-5 list-disc">
  //               <div
  //                 dangerouslySetInnerHTML={{ __html: problem.constraints }}
  //               />
  //             </ul>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};
export default ProblemDescription;
