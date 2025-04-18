import User from "../models/User.js";

export const testFirebaseAuth = async (req, res) => {
  try {
    // req.user is populated by the verifyFirebaseToken middleware
    const { uid, email } = req.user;

    // Find user in database using the Firebase UID
    const user = await User.findByUid(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại trong cơ sở dữ liệu",
        firebaseUser: req.user,
      });
    }

    // Return user information
    res.status(200).json({
      success: true,
      message: "Xác thực Firebase thành công và tìm thấy người dùng",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Test controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
