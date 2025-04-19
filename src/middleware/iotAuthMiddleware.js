import User from "../models/User.js";

const iotAuthMiddleware = async (req, res, next) => {
  const token = req.headers["x-device-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Device token missing",
    });
  }

  try {
    // The token is just the user's UID
    const user = await User.findByUid(token);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Add user info to the request object
    req.user = {
      uid: user.uid,
      id: user.id
    };

    next();
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

export default iotAuthMiddleware;
