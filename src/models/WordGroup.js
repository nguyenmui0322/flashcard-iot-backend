import { db } from "../config/firebase.js";

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

  static async create(groupData) {
    const newGroup = {
      name: groupData.name,
      description: groupData.description || "",
      userId: groupData.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        totalWords: 0,
        learnedWords: 0,
        currentWordId: null,
      },
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
      updatedAt: new Date().toISOString(),
    };

    await wordGroupsCollection.doc(id).update(updatedData);

    const updated = await this.findById(id);
    return updated;
  }

  static async delete(id) {
    await wordGroupsCollection.doc(id).delete();
    return { id };
  }

  static async updateProgress(id, progress) {
    await wordGroupsCollection.doc(id).update({
      progress: progress,
      updatedAt: new Date().toISOString(),
    });

    return await this.findById(id);
  }

  static async setCurrentWord(id, wordId) {
    const group = await this.findById(id);
    if (!group) return null;

    const updatedProgress = {
      ...group.progress,
      currentWordId: wordId,
    };

    return await this.updateProgress(id, updatedProgress);
  }
}

export default WordGroup;
