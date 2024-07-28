import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = [
  "#DC3545",
  "#F8312F",
  "#F9C23C",
  "#17A2B8",
  "#28A745",
  "#343A40",
  "#FFC107",
  "#212529",
];

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}
