import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import AnotherWorkspace from "@/components/AnotherWorkspace/Workspace";
import { problems } from "@/utils/problems";

import React from "react";
import { ProblemType } from "@/utils/types/problemType";

type ProblemPageProps = {
    problem: ProblemType;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
    return (
        <>
            <div>
                <Topbar />
                {/* <Workspace problem={problem}/> */}
                <AnotherWorkspace problem={problem} />
            </div>
        </>
    );
};
export default ProblemPage;


export async function getStaticProps() {
    const pid = "two-sum";
    const problem = problems[pid];

    if (!problem) {
        return {
            notFound: true,
        };
    }
    problem.handlerFunction = problem.handlerFunction.toString();

    return {
        props: {
            problem,
        },
    };
}
