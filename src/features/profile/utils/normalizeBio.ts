import { BIO_MAX_LENGTH } from "../constants";

export function normalizeBio(value: string): string {
  return value.trim().slice(0, BIO_MAX_LENGTH);
}
