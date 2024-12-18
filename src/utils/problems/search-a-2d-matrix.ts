import { ProblemType } from "../types/problemType";

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
`,
  examples: `
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
`,
  constraints: `
1. m == matrix.length
2. n == matrix[i].length
3. 1 <= m, n <= 100
4. -10^4 <= matrix[i][j], target <= 10^4
`,
  solutions: [
    {
      pseudocode: `
1. Start by treating the matrix as a single sorted array.
2. Use binary search:
   - Let left = 0 and right = m * n - 1 (total elements in the matrix).
   - While left <= right:
     - Compute mid = (left + right) // 2.
     - Use mid / n and mid % n to map the 1D mid index to the 2D row and column indices.
     - Compare the matrix[row][col] with the target.
       - If equal, return true.
       - If less, move left to mid + 1.
       - If greater, move right to mid - 1.
3. Return false if the loop ends without finding the target.
`,
      code: `
def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False

    rows, cols = len(matrix), len(matrix[0])
    left, right = 0, rows * cols - 1

    while left <= right:
        mid = (left + right) // 2
        row, col = divmod(mid, cols)
        mid_value = matrix[row][col]

        if mid_value == target:
            return True
        elif mid_value < target:
            left = mid + 1
        else:
            right = mid - 1

    return False
`,
    },
  ],
  starterCode: starterCodeSearch2DMatrixPython,
};
