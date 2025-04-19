import { admin, db } from "../config/firebase.js";

const devicesCollection = db.collection("devices");

class Device {
  static async findByDeviceId(deviceId) {
    const snapshot = await devicesCollection.where("deviceId", "==", deviceId).get();
    if (snapshot.empty) {
      return null;
    }

    const deviceData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...deviceData,
    };
  }

  static async findByToken(token) {
    const snapshot = await devicesCollection.where("token", "==", token).get();
    if (snapshot.empty) {
      return null;
    }

    const deviceData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...deviceData,
    };
  }

  static async create(deviceData) {
    const deviceRef = await devicesCollection.add({
      deviceId: deviceData.deviceId,
      userId: deviceData.userId,
      token: deviceData.token,
      wifiSSID: deviceData.wifiSSID || null,
      wifiPassword: deviceData.wifiPassword || null,
      createdAt: admin.firestore.Timestamp.now(),
    });

    return {
      id: deviceRef.id,
      deviceId: deviceData.deviceId,
      userId: deviceData.userId,
      token: deviceData.token,
      wifiSSID: deviceData.wifiSSID,
      wifiPassword: deviceData.wifiPassword,
    };
  }

  static async updateWifiCredentials(deviceId, wifiSSID, wifiPassword) {
    const snapshot = await devicesCollection.where("deviceId", "==", deviceId).get();
    if (snapshot.empty) {
      return null;
    }

    const deviceRef = snapshot.docs[0].ref;
    await deviceRef.update({
      wifiSSID,
      wifiPassword,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      id: deviceRef.id,
      deviceId: deviceId,
      wifiSSID,
      wifiPassword,
    };
  }

  static async deleteDevice(deviceId) {
    const snapshot = await devicesCollection.where("deviceId", "==", deviceId).get();
    if (snapshot.empty) {
      return false;
    }

    await snapshot.docs[0].ref.delete();
    return true;
  }
}

export default Device; 