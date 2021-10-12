// gives back a random element from a given array
export function shuffleArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
