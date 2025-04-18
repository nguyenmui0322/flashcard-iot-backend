import User from "../models/User.js";

const iotAuthMiddleware = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key missing",
    });
  }

  try {
    const isValid = await User.findByUid(apiKey);

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
    }

    req.user = {
      uid: apiKey,
    };

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực API key",
    });
  }
};

export default iotAuthMiddleware;
