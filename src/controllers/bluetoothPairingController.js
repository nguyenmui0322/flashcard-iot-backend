import User from '../models/User.js';
import Device from '../models/Device.js';
import { v4 as uuidv4 } from 'uuid';

// Controller for handling the Bluetooth pairing process
export const pairDevice = async (req, res) => {
  try {
    const { userId, wifiSSID, wifiPassword } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Verify that the user exists
    const user = await User.findByUid(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return the user's UID as the token along with WiFi information
    res.status(200).json({
      success: true,
      message: "Device paired successfully",
      token: userId, // The token is simply the user's UID
      wifiSSID,
      wifiPassword
    });
  } catch (error) {
    console.error("Bluetooth pairing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during device pairing"
    });
  }
};

// Controller for factory reset functionality
export const factoryReset = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    // Find the device
    const device = await Device.findByDeviceId(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    // Delete the device record
    const deleted = await Device.deleteDevice(deviceId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to reset device"
      });
    }

    res.status(200).json({
      success: true,
      message: "Device has been factory reset"
    });
  } catch (error) {
    console.error("Factory reset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during factory reset"
    });
  }
}; 