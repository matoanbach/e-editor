import { ProblemType } from "../types/problemType";

const starterCodeValidParenthesesPython = `def valid_parentheses(s: str) -> bool:
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
`,
  examples: `
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
`,
  constraints: `
1. 1 <= s.length <= 10^4
2. s consists of parentheses only '()[]{}'.
`,
  solutions: [
    {
      pseudocode: `
1. Use a stack to keep track of opening brackets.
2. Create a mapping of closing brackets to their corresponding opening brackets.
3. Loop through each character in the string:
   - If the character is a closing bracket:
     - Check if the stack is not empty and the top of the stack matches the corresponding opening bracket.
     - If not, return false.
     - Otherwise, pop the stack.
   - If the character is an opening bracket, push it onto the stack.
4. At the end, the stack should be empty for the string to be valid.
5. Return true if the stack is empty, otherwise return false.
      `,
      code: `
def valid_parentheses(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    
    return not stack
      `,
    },
  ],
  starterCode: starterCodeValidParenthesesPython,
};
