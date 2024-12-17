import assert from "assert";
import { ProblemType } from "../types/problemType";


export const search2DMatrixHandler = (fn: any) => {
  try {
    const tests = [
      {
        matrix: [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        target: 3,
      },
      {
        matrix: [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        target: 13,
      },
    ];
    const answers = [true, false];
    for (let i = 0; i < tests.length; i++) {
      const result = fn(tests[i].matrix, tests[i].target);
      assert.deepEqual(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("Error from search2DMatrixHandler: ", error);
    throw new Error(error);
  }
};

const starterCodeSearch2DMatrixPython = `def search_matrix(matrix, target):
    # Write your code here
    pass
`;

export const search2DMatrix: ProblemType = {
  id: "search-a-2d-matrix",
  title: "5. Search a 2D Matrix",
  problemDescription: `
Write an efficient algorithm that searches for a value in an m x n matrix. This matrix has the following properties:
1. Integers in each row are sorted from left to right.
2. The first integer of each row is greater than the last integer of the previous row.

Given matrix, an m x n matrix, and target, return true if target is in the matrix, and false otherwise.

Examples:
1. Input: matrix = [
     [1,3,5,7],
     [10,11,16,20],
     [23,30,34,60]
   ], target = 3
   Output: true

2. Input: matrix = [
     [1,3,5,7],
     [10,11,16,20],
     [23,30,34,60]
   ], target = 13
   Output: false

3. Input: matrix = [[1]], target = 1
   Output: true

Constraints:
1. m == matrix.length
2. n == matrix[i].length
3. 1 <= m, n <= 100
4. -10^4 <= matrix[i][j], target <= 10^4
`,
  starterCode: starterCodeSearch2DMatrixPython,
  // handlerFunction: search2DMatrixHandler,
};
