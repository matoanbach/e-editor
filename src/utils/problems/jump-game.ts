import assert from "assert";
import { ProblemType } from "../types/problemType";

// Handler function for validating the user's solution
export const jumpGameHandler = (fn: any) => {
  try {
    const tests = [
      [2, 3, 1, 1, 4],
      [3, 2, 1, 0, 4],
      [2, 0, 0],
      [2, 5, 0, 0],
    ];
    const answers = [true, false, true, true];
    for (let i = 0; i < tests.length; i++) {
      const result = fn(tests[i]);
      assert.equal(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("Error from jumpGameHandler: ", error);
    throw new Error(error);
  }
};

// Starter code converted to Python
const starterCodeJumpGamePython = `def can_jump(nums):
    # Write your code here
    pass`;

export const jumpGame: ProblemType = {
  id: "jump-game",
  title: "3. Jump Game",
  problemDescription: `
You are given an integer array nums. You are initially positioned at the first index,
and each element in the array represents your maximum jump length at that position.

Return true if you can reach the last index, or false otherwise.
`,
  examples: `
Example 1:
Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.

Example 2:
Input: nums = [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what. Its maximum jump length is 0,
which makes it impossible to reach the last index.
`,
  constraints: `
1. 1 <= nums.length <= 10^4
2. 0 <= nums[i] <= 10^5
`,
  solutions: [
    {
      pseudocode: `
1. Initialize a variable 'max_reachable' to 0 to track the farthest index reachable.
2. Loop through the array 'nums' using an index 'i' and a value 'num':
   - If 'i' > 'max_reachable', return false (you cannot proceed further).
   - Update 'max_reachable' to the maximum of its current value and 'i + num'.
3. After the loop, return true if 'max_reachable' >= last index of the array.
      `,
      code: `
def can_jump(nums):
    max_reachable = 0
    for i, num in enumerate(nums):
        if i > max_reachable:
            return False
        max_reachable = max(max_reachable, i + num)
    return True
      `,
    },
  ],
  starterCode: starterCodeJumpGamePython,
};
