import ApiKey from "../models/ApiKey.js";

const iotAuth = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key missing",
    });
  }

  try {
    const isValid = await ApiKey.isValidKey(apiKey);

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
    }

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực API key",
    });
  }
};

export default iotAuth;
