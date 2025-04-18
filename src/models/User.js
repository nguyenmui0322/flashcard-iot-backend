import { db } from "../config/firebase.js";

const usersCollection = db.collection("users");

class User {
  static async findByUid(uid) {
    const snapshot = await usersCollection.where("uid", "==", uid).get();
    if (snapshot.empty) {
      return null;
    }

    const userData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...userData,
    };
  }

  static async create(userData) {
    const userRef = await usersCollection.add({
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      createdAt: new Date().toISOString(),
    });

    return {
      id: userRef.id,
      email: userData.email,
      name: userData.name,
    };
  }
}

export default User;
