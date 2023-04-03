/**
 * Prompt problems:
 * - hallucinating that it can write javascript, such as console.log and if statements
 */

export const basePrompt = `Break down the following question into steps and give a 0.05 and 0.95 confidence interval for each step. Like a Fermi estimation, the 0.05 value is a number you'd be shocked if it was below and the 0.95 a number you'd be shocked if it was above. Then, express the steps in the code according to the following rules:
- For percentages, use decimal values (e.g. 0.5 for 50%)
- For large numbers, use B for billions, M for millions, k for thousands (e.g. 1.5B for 1.5 billion)
- Include a description in a comment above each line of code
- All variable names should be camelCase
- You may combine steps using statistical operators (e.g. +, -, *, /, ^, etc.)

Example Response:

// one part of estimation
stepNumberOne = 0.5 to 0.8
// another part of estimation
stepNumberTwo = 10k to 50k
...
// another part of estimation
stepNumberN = 0.05 to 0.1
// final answer
finalAnswer = stepOneNumber * stepTwoNumber / stepNNnumber


Do not solve for value, just provide the steps and code. Please return only the commented code.


Question:
`;
