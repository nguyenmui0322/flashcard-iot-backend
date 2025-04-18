import { admin, db } from "../config/firebase.js";

const wordGroupsCollection = db.collection("wordGroups");

class WordGroup {
  static async findAll(userId) {
    const snapshot = await wordGroupsCollection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async findById(id) {
    const doc = await wordGroupsCollection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  static async findByUserId(userId) {
    const snapshot = await wordGroupsCollection
      .where("userId", "==", userId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async create(groupData) {
    const newGroup = {
      name: groupData.name,
      userId: groupData.userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      totalWords: 0,
      learnedWords: 0,
    };

    const docRef = await wordGroupsCollection.add(newGroup);
    return {
      id: docRef.id,
      ...newGroup,
    };
  }

  static async update(id, groupData) {
    const updatedData = {
      ...groupData,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await wordGroupsCollection.doc(id).update(updatedData);

    const updated = await this.findById(id);
    return updated;
  }

  static async delete(id) {
    await wordGroupsCollection.doc(id).delete();
    return { id };
  }
}

export default WordGroup;
