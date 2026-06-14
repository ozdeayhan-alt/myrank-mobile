import { EMPTY_METADATA } from "../types";
import { parseMetadataFromDoc, parseProfileFields } from "./profileDocParsing";

describe("parseMetadataFromDoc", () => {
  it("reads flat metadata fields", () => {
    expect(
      parseMetadataFromDoc({
        country: "TR",
        city: "Istanbul",
        age: 28,
        gender: "Kadın",
        profession: "Mühendis",
        maritalStatus: "Bekar",
      })
    ).toEqual({
      country: "TR",
      city: "Istanbul",
      age: 28,
      gender: "Kadın",
      profession: "Mühendis",
      maritalStatus: "Bekar",
    });
  });

  it("prefers nested metadata object when present", () => {
    expect(
      parseMetadataFromDoc({
        country: "ignored",
        metadata: {
          country: "DE",
          city: "Berlin",
          age: "32",
        },
      })
    ).toEqual({
      country: "DE",
      city: "Berlin",
      age: 32,
      gender: "",
      profession: "",
      maritalStatus: "",
    });
  });
});

describe("parseProfileFields", () => {
  it("parses bio and visibility fields", () => {
    expect(
      parseProfileFields({
        displayName: " Ayşe ",
        photoURL: "https://example.com/a.jpg",
        bio: "  kısa bio  ",
        totalScore: 42,
        bioCategoryVisibility: { city: true },
      })
    ).toEqual({
      metadata: EMPTY_METADATA,
      displayName: " Ayşe ",
      photoURL: "https://example.com/a.jpg",
      bio: "kısa bio",
      bioCategoryVisibility: {
        country: false,
        city: true,
        age: false,
        gender: false,
        profession: false,
        maritalStatus: false,
      },
      totalScore: 42,
    });
  });

  it("defaults missing numeric and string fields safely", () => {
    expect(parseProfileFields({})).toEqual({
      metadata: EMPTY_METADATA,
      displayName: "",
      photoURL: "",
      bio: "",
      bioCategoryVisibility: {
        country: false,
        city: false,
        age: false,
        gender: false,
        profession: false,
        maritalStatus: false,
      },
      totalScore: 0,
    });
  });
});
