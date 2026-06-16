import { pickVariant } from "./gossipScriptSeed";

const FRONT_VOWELS = new Set(["e", "i", "ö", "ü"]);

export function extractFirstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/)[0];
  return part || "kanka";
}

export function toDiminutive(displayName: string): string {
  const firstName = extractFirstName(displayName);
  const vowels = firstName.match(/[aeıioöüAEIİOÖUÜ]/g);
  const lastVowel = vowels?.[vowels.length - 1]?.toLowerCase() ?? "a";
  const suffix = FRONT_VOWELS.has(lastVowel) ? "cim" : "cım";
  return `${firstName}${suffix}`;
}

export function buildGossipIntro(diminutive: string): string {
  return `Sen yokken neler oldu ${diminutive}, dur sana anlatayım!`;
}

export function buildGossipMiddleAside(diminutive: string, seed: number): string {
  return pickVariant(
    [
      `Bak ${diminutive}, bir de şunu duy:`,
      `Dur ${diminutive}, asıl mesele şu:`,
      `Vallaha ${diminutive}, bir de bu var:`,
    ],
    seed
  );
}

export function buildGossipOutro(diminutive: string, seed: number): string {
  return pickVariant(
    [
      `Tamam ${diminutive}, gıybet bu kadar.`,
      `Hepsi bu ${diminutive}, başka yok hayırdır.`,
      `Kapatıyorum ${diminutive}, ortalık bu kadar.`,
    ],
    seed
  );
}

export function buildGossipEmptyMessage(diminutive: string): string {
  return `${diminutive}, ortalık sessiz, bir şey paylaş da gıybet olsun.`;
}
