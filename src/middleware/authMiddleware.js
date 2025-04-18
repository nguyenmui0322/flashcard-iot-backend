import { admin } from "../config/firebase.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
