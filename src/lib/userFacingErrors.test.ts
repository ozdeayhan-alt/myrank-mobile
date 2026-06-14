import { getUserFacingErrorMessage } from "./userFacingErrors";

describe("getUserFacingErrorMessage", () => {
  it("maps network failures to Turkish copy", () => {
    expect(
      getUserFacingErrorMessage(new Error("Network request failed"))
    ).toContain("İnternet bağlantısı");
  });

  it("prefers server detail for upload HTTP errors", () => {
    expect(
      getUserFacingErrorMessage(
        new Error("storagePath must be under posts/{uid}/ (403)")
      )
    ).toBe("storagePath must be under posts/{uid}/");
  });

  it("maps generic HTTP status codes without detail", () => {
    expect(getUserFacingErrorMessage(new Error("request failed (502)"))).toBe(
      "Sunucu geçici olarak yanıt vermiyor."
    );
  });

  it("maps timeout sentinel", () => {
    expect(getUserFacingErrorMessage(new Error("timeout"))).toContain(
      "zaman aşımı"
    );
  });
});
