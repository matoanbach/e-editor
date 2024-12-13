
  export type ProblemType = {
    id: string;
    title: string;
    problemDescription: string;
    starterCode: string;
    handlerFunction: ((fn: any) => boolean) | string;
  };