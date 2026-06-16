import { formatProfileRankingSentence } from "./formatProfileRankingSentence";
import { EMPTY_METADATA } from "../types";

const baseMetadata = {
  ...EMPTY_METADATA,
  country: "Türkiye",
  city: "İzmir",
  age: 28,
  gender: "Erkek",
  profession: "Doktor",
  maritalStatus: "Bekar",
};

describe("formatProfileRankingSentence", () => {
  it("formats country ranking for own profile", () => {
    expect(
      formatProfileRankingSentence({
        key: "country",
        metadata: baseMetadata,
        rank: 1,
        isOfficial: true,
        isOwnProfile: true,
      })
    ).toBe("Türkiye'de en popüler 1. kişisin");
  });

  it("formats city ranking for other profile", () => {
    expect(
      formatProfileRankingSentence({
        key: "city",
        metadata: baseMetadata,
        rank: 3,
        isOfficial: true,
        isOwnProfile: false,
      })
    ).toBe("İzmir'de en popüler 3. kişi");
  });

  it("formats age ranking", () => {
    expect(
      formatProfileRankingSentence({
        key: "age",
        metadata: baseMetadata,
        rank: 5,
        isOfficial: true,
        isOwnProfile: true,
      })
    ).toBe("28 yaşındaki en popüler 5. kişisin");
  });

  it("formats gender ranking", () => {
    expect(
      formatProfileRankingSentence({
        key: "gender",
        metadata: baseMetadata,
        rank: 2,
        isOfficial: true,
        isOwnProfile: true,
      })
    ).toBe("Erkekler arasında en popüler 2. kişisin");
  });

  it("formats global ranking", () => {
    expect(
      formatProfileRankingSentence({
        key: "global",
        metadata: baseMetadata,
        rank: 120,
        isOfficial: true,
        isOwnProfile: true,
      })
    ).toBe("Dünya genelinde en popüler 120. kişisin");
  });

  it("marks unofficial ranks as approximate", () => {
    expect(
      formatProfileRankingSentence({
        key: "country",
        metadata: baseMetadata,
        rank: 12,
        isOfficial: false,
        isOwnProfile: true,
      })
    ).toBe("Türkiye'de en popüler yaklaşık 12. kişisin");
  });
});
