import { ProblemType } from "../types/problemType";

const starterCodeTwoSum = `def two_sum(nums, target):
  # Write your code here`;

export const twoSum: ProblemType = {
  id: "two-sum",
  title: "1. Two Sum",
  problemDescription: `
Given an array of integers nums and an integer target, return
indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you
may not use the same element twice.

You can return the answer in any order.
`,
  examples: `
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
`,
  constraints: `
- 2 ≤ nums.length ≤ 10
- -10 ≤ nums[i] ≤ 10
- -10 ≤ target ≤ 10
- Only one valid answer exists.
`,
  solutions: [
    {
      pseudocode: `
1. Initialize an empty dictionary called 'seen' to store numbers and their indices.
2. Loop through the array 'nums' using an index 'i' and a value 'num'.
3. Calculate the complement as 'target - num'.
4. Check if the complement exists in the 'seen' dictionary:
   - If yes, return the indices [seen[complement], i].
   - If no, store the current number and its index in the 'seen' dictionary.
5. End of loop.
6. Return an empty array (this step won't be needed since the problem guarantees a solution).
      `,
      code: `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
      `,
    },
  ],
  starterCode: starterCodeTwoSum,
};
