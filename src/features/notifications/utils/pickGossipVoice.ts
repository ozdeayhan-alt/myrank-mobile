import * as Speech from "expo-speech";

export type GossipVoiceSelection = {
  voice?: string;
  isFemale: boolean;
};

let cachedSelection: GossipVoiceSelection | undefined;

const PREFERRED_FEMALE_HINTS = [
  "lang_tr_tr_f00",
  "tr-tr-x-trf-local",
  "tr-tr-x-trf",
];

function voiceHaystack(voice: Speech.Voice): string {
  return `${voice.name} ${voice.identifier}`.toLowerCase();
}

function isFemaleVoice(voice: Speech.Voice): boolean {
  const haystack = voiceHaystack(voice);
  return (
    /trf|female|kadın|kadin|woman|femme|lang_tr_tr_f\d|_f00|smt.*f\d/i.test(
      haystack
    ) && !isMaleVoice(voice)
  );
}

function isMaleVoice(voice: Speech.Voice): boolean {
  return /trd|male|erkek|\bman\b|homme|lang_tr_tr_m\d|_m00|smt.*m\d/i.test(
    voiceHaystack(voice)
  );
}

function preferredFemaleBonus(voice: Speech.Voice): number {
  const haystack = voiceHaystack(voice);
  return PREFERRED_FEMALE_HINTS.some((hint) => haystack.includes(hint)) ? 40 : 0;
}

function scoreVoice(voice: Speech.Voice): number {
  let score = preferredFemaleBonus(voice);

  if (voice.quality === Speech.VoiceQuality.Enhanced) {
    score += 10;
  }
  if (isFemaleVoice(voice)) {
    score += 30;
  }
  if (isMaleVoice(voice)) {
    score -= 100;
  }

  return score;
}

export async function pickGossipVoice(): Promise<GossipVoiceSelection> {
  if (cachedSelection) {
    return cachedSelection;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const turkish = voices.filter((voice) =>
      voice.language.toLowerCase().startsWith("tr")
    );

    if (turkish.length === 0) {
      cachedSelection = { voice: undefined, isFemale: false };
      return cachedSelection;
    }

    const nonMale = turkish.filter((voice) => !isMaleVoice(voice));
    const females = nonMale.filter(isFemaleVoice);
    const pool = females.length > 0 ? females : nonMale.length > 0 ? nonMale : turkish;

    pool.sort((a, b) => scoreVoice(b) - scoreVoice(a));

    const selected = pool[0];
    cachedSelection = {
      voice: selected?.identifier,
      isFemale: selected ? isFemaleVoice(selected) : false,
    };
    return cachedSelection;
  } catch {
    cachedSelection = { voice: undefined, isFemale: false };
    return cachedSelection;
  }
}
