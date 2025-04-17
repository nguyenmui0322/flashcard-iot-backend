import { db } from "../config/firebase.js";

const apiKeysCollection = db.collection("apiKeys");

class ApiKey {
  static async isValidKey(apiKey) {
    const snapshot = await apiKeysCollection
      .where("key", "==", apiKey)
      .where("isActive", "==", true)
      .get();

    return !snapshot.empty;
  }

  static async createKey(keyData) {
    const apiKeyRef = await apiKeysCollection.add({
      key: keyData.key,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: keyData.userId || null,
    });

    return {
      id: apiKeyRef.id,
      ...keyData,
    };
  }
}

export default ApiKey;
