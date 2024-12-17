import Topbar from "@/components/Topbar/Topbar";
import AnotherWorkspace from "@/components/AnotherWorkspace/Workspace";
import { problems } from "@/utils/problems";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { setProblem } from "@/state/editor/editorSlice";

type ProblemPageProps = {
    // problem: ProblemType
};

const ProblemPage: React.FC<ProblemPageProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const pid = "two-sum";
        const problem = problems[pid];
        dispatch(setProblem(problem));
    }, []);
    // dispatch(setProblem(problem))
    return (
            <div>
                <Topbar enabled={true}/>
                <AnotherWorkspace />
            </div>
    );
};
export default ProblemPage;

// (Optional): generate a random problem before rendering the editor

// export async function getStaticProps() {
//     const dispatch = useDispatch<AppDispatch>();

//     const pid = "two-sum";
//     const problem = problems[pid];
//     dispatch(setProblem(problem));

//     if (!problem) {
//         return {
//             notFound: true,
//         };
//     }
//     // problem.handlerFunction = problem.handlerFunction.toString();

//     return {
//         props: {
//             problem,
//         },
//     };
// }
