import assert from "assert";
import { ProblemType } from "../types/problemType";


export const validParenthesesHandler = (fn: any) => {
  try {
    const tests = ["()", "()[]{}", "(]", "([)]", "{[]}"];
    const answers = [true, true, false, false, true];
    for (let i = 0; i < tests.length; i++) {
      const result = fn(tests[i]);
      assert.deepEqual(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.error("Error from validParenthesesHandler: ", error);
    throw new Error(error);
  }
};

const starterCodeValidParenthesesPython = `
def valid_parentheses(s: str) -> bool:
    # Write your code here
    pass
`;

export const validParentheses: ProblemType = {
  id: "valid-parentheses",
  title: "4. Valid Parentheses",
  problemDescription: `
Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Examples:
1. Input: s = "()"
   Output: true

2. Input: s = "()[]{}"
   Output: true

3. Input: s = "(]"
   Output: false

4. Input: s = "([)]"
   Output: false

5. Input: s = "{[]}"
   Output: true

Constraints:
1. 1 <= s.length <= 10^4
2. s consists of parentheses only '()[]{}'.
`,
  starterCode: starterCodeValidParenthesesPython,
  // handlerFunction: validParenthesesHandler,
};
