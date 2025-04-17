export const getFlashcardsForIoT = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu cho thiết bị IoT",
    });
  }
};
