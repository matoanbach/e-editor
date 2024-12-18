import { ProblemType } from "../types/problemType";

// Starter code in Python
const starterCodeReverseLinkedList = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Do not edit the function name
def reverse_linked_list(head):
    # Write your code here
    pass
`;

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
};
