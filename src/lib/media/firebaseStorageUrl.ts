export function buildFirebaseDownloadURL(
  bucket: string,
  objectPath: string,
  downloadToken: string
): string {
  const encodedName = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedName}?alt=media&token=${downloadToken}`;
}
