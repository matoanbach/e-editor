import assert from "assert";
import { ProblemType } from "../types/problemType";

// Starter code in Python
const starterCodeReverseLinkedList = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Do not edit the function name
def reverse_linked_list(head):
    # Write your code here
    pass
`;

// Define the ListNode type
class ListNode {
  val: number;
  next: ListNode | null;

  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

// Python handler function for reverse linked list
const reverseLinkedListHandler = (fn: any) => {
  try {
    const tests = [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [1, 2, 3], [1]];
    const answers = [[5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [3, 2, 1], [1]];
    for (let i = 0; i < tests.length; i++) {
      const list = createLinkedList(tests[i]);
      const result = fn(list);
      assert.deepStrictEqual(getListValues(result), answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("Error from reverseLinkedListHandler: ", error);
    throw new Error(error);
  }
};

// Create a linked list from an array
function createLinkedList(values: number[]): ListNode | null {
  if (values.length === 0) return null;

  const head = new ListNode(values[0]);
  let current = head;
  for (let i = 1; i < values.length; i++) {
    current.next = new ListNode(values[i]);
    current = current.next;
  }
  return head;
}

// Get an array of values from a linked list
function getListValues(head: ListNode | null): number[] {
  const values: number[] = [];
  let current = head;
  while (current) {
    values.push(current.val);
    current = current.next;
  }
  return values;
}

// Problem description as plain text
export const reverseLinkedList: ProblemType = {
  id: "reverse-linked-list",
  title: "2. Reverse Linked List",
  problemDescription: `
Given the head of a singly linked list, reverse the list and return the reversed list.

Examples:
Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Example 2:
Input: head = [1,2,3]
Output: [3,2,1]

Example 3:
Input: head = [1]
Output: [1]

Constraints:
- The number of nodes in the list is in the range [0, 5000].
- -5000 <= Node.val <= 5000.
  `,
  starterCode: starterCodeReverseLinkedList,
  handlerFunction: reverseLinkedListHandler,
};
