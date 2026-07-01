import { EMPTY_METADATA } from "../types";
import {
  parseMetadataFromDoc,
  parseProfileFields,
  sanitizeApiPublicProfile,
  sanitizeUserMetadata,
} from "./profileDocParsing";

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

describe("sanitizeUserMetadata", () => {
  it("returns empty metadata for nullish input", () => {
    expect(sanitizeUserMetadata(null)).toEqual(EMPTY_METADATA);
    expect(sanitizeUserMetadata(undefined)).toEqual(EMPTY_METADATA);
  });

  it("coerces null metadata fields to empty strings", () => {
    expect(
      sanitizeUserMetadata({
        country: "TR",
        city: null,
        gender: undefined,
        profession: "Doktor",
      })
    ).toEqual({
      country: "TR",
      city: "",
      age: null,
      gender: "",
      profession: "Doktor",
      maritalStatus: "",
    });
  });
});

describe("sanitizeApiPublicProfile", () => {
  it("normalizes API profile missing displayName", () => {
    expect(
      sanitizeApiPublicProfile({
        userId: "u1",
        totalScore: 10,
        metadata: {
          country: "TR",
          city: "İzmir",
          age: 25,
          gender: "Kadın",
          profession: "Öğretmen",
          maritalStatus: "Bekar",
        },
      })
    ).toMatchObject({
      displayName: "",
      totalScore: 10,
      metadata: {
        country: "TR",
        city: "İzmir",
        age: 25,
        gender: "Kadın",
        profession: "Öğretmen",
        maritalStatus: "Bekar",
      },
    });
  });

  it("returns null for non-object profile", () => {
    expect(sanitizeApiPublicProfile(null)).toBeNull();
    expect(sanitizeApiPublicProfile(undefined)).toBeNull();
  });
});
