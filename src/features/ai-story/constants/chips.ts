import type { StoryChip } from "./types";

export const MOOD_CHIPS: StoryChip[] = [
  { key: "peaceful", label: "Huzurlu" },
  { key: "energetic", label: "Enerjik" },
  { key: "stressed", label: "Stresli" },
  { key: "cool", label: "Cool" },
  { key: "romantic", label: "Romantik" },
  { key: "focused", label: "Odaklı" },
];

export const LOCATION_CHIPS: StoryChip[] = [
  { key: "beach", label: "Sahil" },
  { key: "city_night", label: "Gece şehir" },
  { key: "nature", label: "Doğa" },
  { key: "home", label: "Ev" },
  { key: "cafe", label: "Kafe" },
  { key: "gym", label: "Spor salonu" },
];

export const ACTION_CHIPS: StoryChip[] = [
  { key: "walking", label: "Yürüyorum" },
  { key: "relaxing", label: "Dinleniyorum" },
  { key: "having_fun", label: "Eğleniyorum" },
  { key: "working", label: "Çalışıyorum" },
  { key: "traveling", label: "Seyahat" },
  { key: "exercising", label: "Spor" },
];

export function chipLabel(
  chips: StoryChip[],
  key: string | undefined
): string {
  return chips.find((chip) => chip.key === key)?.label ?? key ?? "";
}
