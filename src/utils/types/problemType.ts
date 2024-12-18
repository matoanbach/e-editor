export type Solution = {
  pseudocode: string,
  code: string;  
}

export type ProblemType = {
  id: string;
  title: string;
  problemDescription: string;
  examples: string;
  constraints: string;
  solutions: Solution[];
  starterCode: string;
};
