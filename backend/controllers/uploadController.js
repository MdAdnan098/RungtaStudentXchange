import { getImageKitAuthParams } from "../config/imagekit.js";

// @desc    Get a signed token so the browser can upload directly to
//          ImageKit (bypassing our backend entirely for the actual
//          file bytes)
// @route   GET /api/uploads/auth
// @access  Private (logged-in users only — an anonymous visitor
//          shouldn't be able to mint upload tokens for our account)
export const getUploadAuth = (req, res) => {
  try {
    const authParams = getImageKitAuthParams();

    return res.status(200).json({
      success: true,
      message: "Upload authentication generated",
      data: {
        ...authParams,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate upload authentication",
      data: null,
    });
  }
};