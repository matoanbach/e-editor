import assert from "assert";
import { ProblemType } from "../types/problemType";


const starterCodeTwoSum = `def two_sum(nums, target):
  # Write your code here
  # Write your code here
  # Write your code here`;

// Checks if the user has the correct code
const handlerTwoSum = (fn: any) => {
  try {
    const nums = [
      [2, 7, 11, 15],
      [3, 2, 4],
      [3, 3],
    ];

    const targets = [9, 6, 6];
    const answers = [
      [0, 1],
      [1, 2],
      [0, 1],
    ];

    // Loop through all tests to check if the user's code is correct
    for (let i = 0; i < nums.length; i++) {
      const result = fn(nums[i], targets[i]);
      assert.deepStrictEqual(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("twoSum handler function error");
    throw new Error(error);
  }
};

// Merged problemDescription field without HTML
export const twoSum: ProblemType = {
  id: "two-sum",
  title: "1. Two Sum",
  problemDescription: `
Given an array of integers nums and an integer target, return
indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you
may not use the same element twice.

You can return the answer in any order.

Examples:
Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]
Explanation: Because nums[1] + nums[2] == 6, we return [1, 2].

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 ≤ nums.length ≤ 10
- -10 ≤ nums[i] ≤ 10
- -10 ≤ target ≤ 10
- Only one valid answer exists.
  `,
  starterCode: starterCodeTwoSum,
  handlerFunction: handlerTwoSum,
};
