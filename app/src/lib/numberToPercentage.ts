/**
 * Takes in a number
 * If the number is between 0 and 1,
 * it returns a percentage with 2 decimal places
 * If the number is greater than 1 or less than 0
 * it returns the number rounded to 2 decimal places
 */
export function numberToPercentage(n: number) {
  try {
    if (n >= 0 && n <= 1) {
      const percentage = (n * 100).toFixed(2);
      return `${parseFloat(percentage)}%`;
    } else {
      return n.toFixed(2);
    }
  } catch (error) {
    console.error(`Received ${n} as input`);
    console.error(error);
    return n;
  }
}
