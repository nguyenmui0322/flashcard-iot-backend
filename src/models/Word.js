import { db } from "../config/firebase.js";

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
    const newWord = {
      term: wordData.term,
      definition: wordData.definition,
      example: wordData.example || "",
      pronunciation: wordData.pronunciation || "",
      groupId: wordData.groupId,
      status: "active", // active, learned, timeout
      timeoutUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update the word count in the group
    const groupRef = db.collection("wordGroups").doc(wordData.groupId);
    const groupDoc = await groupRef.get();

    if (groupDoc.exists) {
      const groupData = groupDoc.data();
      await groupRef.update({
        "progress.totalWords": (groupData.progress?.totalWords || 0) + 1,
        updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
    };

    await wordsCollection.doc(id).update(updatedData);

    const updated = await this.findById(id);
    return updated;
  }

  static async delete(id) {
    const word = await this.findById(id);
    if (!word) return null;

    // Update the word count in the group
    const groupRef = db.collection("wordGroups").doc(word.groupId);
    const groupDoc = await groupRef.get();

    if (groupDoc.exists) {
      const groupData = groupDoc.data();
      const totalWords = Math.max(0, (groupData.progress?.totalWords || 0) - 1);
      const learnedWords = Math.max(
        0,
        (groupData.progress?.learnedWords || 0) -
          (word.status === "learned" ? 1 : 0)
      );

      await groupRef.update({
        "progress.totalWords": totalWords,
        "progress.learnedWords": learnedWords,
        updatedAt: new Date().toISOString(),
      });
    }

    await wordsCollection.doc(id).delete();
    return { id };
  }

  static async setTimeout(id, hours = 24) {
    const timeoutUntil = new Date();
    timeoutUntil.setHours(timeoutUntil.getHours() + hours);

    await wordsCollection.doc(id).update({
      status: "timeout",
      timeoutUntil: timeoutUntil.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return await this.findById(id);
  }

  static async markAsLearned(id) {
    const word = await this.findById(id);
    if (!word) return null;

    // Update the learned count in the group
    if (word.status !== "learned") {
      const groupRef = db.collection("wordGroups").doc(word.groupId);
      const groupDoc = await groupRef.get();

      if (groupDoc.exists) {
        const groupData = groupDoc.data();
        await groupRef.update({
          "progress.learnedWords": (groupData.progress?.learnedWords || 0) + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await wordsCollection.doc(id).update({
      status: "learned",
      updatedAt: new Date().toISOString(),
    });

    return await this.findById(id);
  }
}

export default Word;
