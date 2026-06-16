import {
  buildGossipIntro,
  extractFirstName,
  toDiminutive,
} from "./gossipPersonalization";

describe("gossipPersonalization", () => {
  it("extracts first name only", () => {
    expect(extractFirstName("Ayhan Yılmaz")).toBe("Ayhan");
  });

  it("builds intro with diminutive", () => {
    expect(buildGossipIntro("Ayhancım")).toBe(
      "Sen yokken neler oldu Ayhancım, dur sana anlatayım!"
    );
  });

  it("falls back when display name is empty", () => {
    expect(toDiminutive("")).toBe("kankacım");
  });
});
