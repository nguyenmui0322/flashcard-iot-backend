import { admin, db } from "../config/firebase.js";

const wordsCollection = db.collection("words");

class Word {
  static async findByGroupId(groupId) {
    const snapshot = await wordsCollection
      .where("groupId", "==", groupId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async findById(id) {
    const doc = await wordsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  static async create(wordData) {
    const id = wordData.groupId;

    const newWord = {
      ...wordData,
      status: "active",
      lastReviewed: admin.firestore.Timestamp.now(),
      timeoutUntil: null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const groupRef = db.collection("wordGroups").doc(id);
    const groupDoc = await groupRef.get();

    if (groupDoc.exists) {
      const groupData = groupDoc.data();
      await groupRef.update({
        totalWords: (groupData?.totalWords || 0) + 1,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    const docRef = await wordsCollection.add(newWord);
    return {
      id: docRef.id,
      ...newWord,
    };
  }

  static async update(id, wordData) {
    const updatedData = {
      ...wordData,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await wordsCollection.doc(id).update(updatedData);

    const updated = await this.findById(id);
    return updated;
  }

  static async delete(id) {
    return await wordsCollection.doc(id).delete();
  }
}

export default Word;
