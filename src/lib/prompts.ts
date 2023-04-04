export const systemPrompt =
  "You are a prediction specialist. You use fermi estimation techniques to break complex problems into smaller pieces.";

/**
 * Prompt problems:
 * - hallucinating that it can write javascript, such as console.log and if statements
 * - using wrong scientific notation: radiusEarth = 6.2E+3 to 7.0E+3
 */

export const basePrompt = `Break down the following question into steps and give a 0.05 and 0.95 confidence interval for each step. Like a Fermi estimation, the 0.05 value is a number you'd be shocked if it was below and the 0.95 a number you'd be shocked if it was above. Then, express the steps in the code according to the following rules:
- For percentages, use decimal values (e.g. 0.5 for 50%)
- For large or small use a suffix: 'n' for 10^-9, 'm' for 10^-3, 'k' for 10^3, 'M' for 10^6, and 'B' or 'G' for for 10^9, 'T' for 10^12, and 'P' 10^15 (e.g. 1.2M for 1,200,000)
- Do not add units to numbers (e.g. 1.2M is correct, 1.2M km is not)
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
finalAnswer = stepNumberOne * stepNumberTwo / stepNumberN


Do not solve for value, just provide the steps and code. Please return only the commented code.


Question:\n`;
