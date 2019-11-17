import firebase from "firebase";
import app from "firebase/app";
import * as geolib from "geolib";
import { AsyncStorage } from "react-native";
import uuid from "uuid";

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

const METERS_TO_MILES = 1609.344;

export default class Firebase {
  constructor() {
    if (!firebase.apps.length) {
      app.initializeApp(firebaseConfig);
    }
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
      await this.user(user.uid).update({ id: user.uid });
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
      location: "",
      age: null,
      bio: "",
      conversations: [],
      gender: null,
      picture: "",
      swiped: []
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

  messages = () => this.db.ref("messages");

  /**
   * @param gender 0 or 1 (1: male, 0: female)
   * @param distanceThreshold distance threshold in meters
   */
  getAllUsersWithGenderAndDistanceAway = async (
    user,
    gender,
    distanceThreshold
  ) => {
    const usersRef = this.users();
    const usersSnapshot = await usersRef.once("value");

    const usersObj = usersSnapshot.val();
    const usersArray = Object.keys(usersObj).map(key => usersObj[key]);
    return usersArray.filter(otherUser => {
      if (
        otherUser.id === user.id ||
        !otherUser.location ||
        !otherUser.location.coords ||
        (user.hasOwnProperty("seen") && user.seen.hasOwnProperty(otherUser.id))
      ) {
        return false;
      }
      const distanceObjUser = {
        latitude: otherUser.location.coords.latitude,
        longitude: otherUser.location.coords.longitude
      };
      const distanceObjOtherUser = {
        latitude: user.location.coords.latitude,
        longitude: user.location.coords.longitude
      };
      console.log(
        "Distance: " + geolib.getDistance(distanceObjUser, distanceObjOtherUser)
      );
      return (
        otherUser.gender == gender &&
        geolib.getDistance(distanceObjUser, distanceObjOtherUser) <
          distanceThreshold
      );
    });
  };

  usersSwiped = uid =>
    this.db
      .ref("users")
      .child(uid)
      .child("swiped");

  userSwiped = (uid, sid) => this.db.ref(`users/${uid}/swiped/${sid}`);

  userSeen = (uid, sid) => this.db.ref(`users/${uid}/seen/${sid}`);

  usersSeen = (uid, sid) => this.db.ref(`users/${uid}/seen`);

  conversation = uid => this.db.ref(`conversation`);

  getCurrentUser = async () => {
    const token = await AsyncStorage.getItem("userToken");
    return JSON.parse(token);
  };

  transformObjectToArray = obj => {
    const array = [];
    Object.keys(obj).forEach(key => array.push(obj[key]));
    return array;
  };

  /**
   * Gets all messages. Includes ID of messages.
   * @return {Array} An Array of message Objects, which look like:
   * {
   *   content: 'something',
   *   conversation: 'conversationId',
   *   sender: 'someUserId',
   *   timestamp: someTimestamp
   *   id: 'someMessageId'
   * }
   */
  getAllMessages = () => {
    const messagesRef = this.messages();
    return messagesRef.once("value").then(snapshot => {
      const snapVal = snapshot.val();
      return Object.keys(snapVal).map(msgId => ({
        ...snapVal[msgId],
        id: msgId
      }));
    });
  };

  /**
   * Like getAllMessages, but is called every time the database changes
   */
  getAllMessagesListen = callback => {
    console.log("LISTENER CALLED");
    const messagesRef = this.messages();
    return messagesRef.on("value", snapshot => {
      const snapVal = snapshot.val();
      const toReturn = Object.keys(snapVal).map(msgId => ({
        ...snapVal[msgId],
        id: msgId
      }));
      callback(toReturn);
    });
  };

  /**
   * Uploads a message.
   */
  uploadMessage = (text, conversationId) => {
    const uid = this.auth.currentUser.uid;
    const id = uuid.v4();
    return this.db.ref("messages/" + id).set({
      sender: uid,
      content: text,
      conversation: conversationId,
      timestamp: Math.floor(new Date() / 1000)
    });
  };

  /**
   * Filters an array of messages, taking out messages not belonging to the specified
   *   conversation.
   * @param  {String} id       ID of the conversation to filter for messages
   * @param  {Array} messages Array of messages; see getAllMessages for message structure.
   */
  filterMessages = (id, messages) => {
    return messages.filter(msg => msg.conversation === id);
  };

  /**
   * Sorts messages by their timestamp. Returns a NEW ARRAY; does not mutate input.
   * @param  {Array} messages Array of messages; see getAllMessages for message structure.
   */
  sortMessages = messages => {
    const toSort = [...messages];
    toSort.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
    return toSort;
  };
}
