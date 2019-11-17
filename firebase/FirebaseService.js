import app from "firebase";
import { AsyncStorage } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCzgMTmPJXZiCdySEwT1xyiN2ykJlZfdxY",
  authDomain: "flame-65b54.firebaseapp.com",
  databaseURL: "https://flame-65b54.firebaseio.com",
  projectId: "flame-65b54",
  storageBucket: "flame-65b54.appspot.com",
  messagingSenderId: "131750955465",
  appId: "1:131750955465:web:e3be0337080ee800ea8018",
  measurementId: "G-Y1CYEZ3SE2"
};

export default class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);
    this.auth = app.auth();
    this.db = app.database();
  }

  signInWithEmail = async (email, password) => {
    try {
      const { user } = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      await AsyncStorage.setItem("userToken", JSON.stringify(user.uid));
      return user;
    } catch (e) {
      console.error(e);
      return e;
    }
  };

  signUpWithEmail = async (email, password, username = "") => {
    const userObj = {
      email,
      username,
      balance: 0,
      categories: []
    };
    try {
      const { user } = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await AsyncStorage.setItem("userToken", JSON.stringify(user.uid));
      await this.user(user.uid).set(userObj);
      return user;
    } catch (e) {
      console.error(e);
      return e;
    }
  };

  signOut = async () => {
    await this.auth.signOut();
    await AsyncStorage.setItem("userToken", "");
  };

  resetPassword = email => this.auth.sendPasswordResetEmail(email);

  updatePassword = password => this.auth.currentUser.updatePassword(password);

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref("users");

  getCurrentUser = async () => {
    const token = await AsyncStorage.getItem("userToken");
    return JSON.parse(token);
  };

  transformObjectToArray = obj => {
    const array = [];
    Object.keys(obj).forEach(key => array.push(obj[key]));
    return array;
  };
}
