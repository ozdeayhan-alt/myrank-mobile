import { buildFirebaseDownloadURL } from "./firebaseStorageUrl";

describe("buildFirebaseDownloadURL", () => {
  it("builds a Firebase media URL with token", () => {
    expect(
      buildFirebaseDownloadURL(
        "myrankapp-d62b9.firebasestorage.app",
        "posts/user123/photo.jpg",
        "abc123"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/posts%2Fuser123%2Fphoto.jpg?alt=media&token=abc123"
    );
  });
});
