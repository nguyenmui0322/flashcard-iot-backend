import WordGroup from "../models/WordGroup.js";

export const getProgress = async (req, res) => {
  try {
    const { uid } = req.user;

    const progress = await WordGroup.findByUserId(uid);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin tiến độ",
      error: error.message,
    });
  }
};
