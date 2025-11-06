export function cn(...inputs: Array<string | number | boolean | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}