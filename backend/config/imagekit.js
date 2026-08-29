import ImageKit from "imagekit";

// Client-direct-upload architecture: the browser uploads straight to
// ImageKit's servers (never through our backend), so Render never
// touches image bytes. This file's only two jobs are (1) generate a
// short-lived signed token so the browser can prove it's allowed to
// upload, and (2) delete files by fileId when a listing/avatar is
// removed or replaced.
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Signed params expire in a few minutes — plenty of time for the
// browser to immediately use them for one upload, short enough that
// a leaked token is useless shortly after.
export const getImageKitAuthParams = () => imagekit.getAuthenticationParameters();

export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return null;
  return imagekit.deleteFile(fileId);
};

export default imagekit;