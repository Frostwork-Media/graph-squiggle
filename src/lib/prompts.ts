export const basePrompt = `Please break down the question at the end of this prompt into steps, like a Fermi estimation, giving a 0.05 and 0.95 confidence interval for each step. (Remember the 0.05 value is a number you'd be shocked if it was below and the 0.95 a number you'd be shocked if it was above) Then, express the steps in the code according to the following rules:
- Use decimal instead of percent
- B for billions, M for millions, k for thousands
- Include a description in a comment above each line of code
- variable names should be camelCase

Example:

// Description of variable stepNumberOne
stepNumberOne = lowerValue to higherValue
// stepNumberTwo description
stepNumberTwo = lowerValue to higherValue
...
// stepNumberN description
stepNumberN = lowerValue to higherValue

// [Original question]
total =  stepOneNumber * stepTwoNumber ... / stepNNnumber


Do not attempt to work the value out please, just provide the steps and code. Please return only the commented code.


Question:
`;
