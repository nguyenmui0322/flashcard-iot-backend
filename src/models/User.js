import { db } from "../config/firebase.js";
import bcrypt from "bcrypt";

const usersCollection = db.collection("users");

class User {
  static async findByEmail(email) {
    const snapshot = await usersCollection.where("email", "==", email).get();
    if (snapshot.empty) {
      return null;
    }

    const userData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...userData,
    };
  }

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const userRef = await usersCollection.add({
      uid: userData.uid,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: "user",
      createdAt: new Date().toISOString(),
    });

    return {
      id: userRef.id,
      email: userData.email,
      name: userData.name,
      role: "user",
    };
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;
