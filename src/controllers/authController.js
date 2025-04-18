import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { uid, email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    const user = await User.create({ uid, email, password, name });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
