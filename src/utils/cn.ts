export function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}
