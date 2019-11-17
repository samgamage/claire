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
    this.storage = firebase.storage();
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

  userConversation = uid => this.db.ref(`users/${uid}/conversation`);

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

  conversation = cid => this.db.ref(`conversation/${cid}`);

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
   * Like getAllMessages, but callback is called every time the database changes
   */
  getAllMessagesListen = callback => {
    console.log("MESSAGES LISTENER TRIGGERED");
    const messagesRef = this.messages();
    return messagesRef.on("value", snapshot => {
      const snapVal = snapshot.val();
      if (snapVal == null) {
        callback([]);
        return;
      }
      const toReturn = Object.keys(snapVal).map(msgId => ({
        ...snapVal[msgId],
        id: msgId
      }));
      callback(toReturn);
    });
  };

  detachAllMessagesListen = () => {
    console.log("DETACHING ALL_MESSAGES LISTENER");
    const messagesRef = this.messages();
    return messagesRef.off();
  };

  /**
   * Gets a conversation
   * @param  {String} id ID of the conversation
   * @return {Object}    Conversation object with structure:
   * {
   *
   * }
   */
  getConversation = id => {
    return this.db
      .ref("conversation/" + id)
      .once("value")
      .then(snapshot => {
        const snapVal = snapshot.val();
        return snapVal;
      });
  };

  /**
   * Like getConversation, but listens in real time, and triggers callback whenever change
   *   is detected to the specified conversation
   */
  getConversationListen = (id, callback) => {
    console.log("CONVERSATION LISTENER TRIGGERED");
    const messagesRef = this.db.ref("conversation/" + id);
    return messagesRef.on("value", snapshot => {
      const snapVal = snapshot.val();
      callback(snapVal);
    });
  };

  detachConversationListen = id => {
    console.log(`DETACHING CONVERSATION LISTENER FOR ${id}`);
    const convoRef = this.db.ref("conversation/" + id);
    convoRef.off();
  };

  /* Like getConversation, but grabs the entire root-level conversation object, and turns it into
   *   an array of conversation objects, each object having same structure as those returned
   * *
   *  from getConversation.
   */
  getConversations = callback => {
    const conversationsRef = this.db.ref("conversation");
    return conversationsRef.once("value").then(snapshot => {
      const snapVal = snapshot.val();
      if (!snapVal) {
        callback(null);
        return;
      }
      return Object.keys(snapVal).map(convoId => ({
        ...snapVal[convoId],
        id: convoId
      }));
    });
  };

  /* Like getConversation, but grabs the entire root-level conversation object, and turns it into
   *   an array of conversation objects, each object having same structure as those returned
   * *
   *  from getConversation.
   */
  getConversationsListen = callback => {
    const conversationsRef = this.db.ref("conversation");
    return conversationsRef.on("value", snapshot => {
      const snapVal = snapshot.val();
      if (!snapVal) {
        callback(null);
        return;
      }
      const toReturn = Object.keys(snapVal).map(convoId => ({
        ...snapVal[convoId],
        id: convoId
      }));
      callback(toReturn);
    });
  };

  /**
   * Gets the profile pic URL of a user.
   *
   * @param {String} uid - the ID of the user
   *
   * @return A Promise resolving to the profile pic URL of the desired user.
   */
  getProfilePic = uid => {
    return this.storage
      .ref()
      .child(`profilePics/${uid}.jpg`)
      .getDownloadURL();
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
   * Updates sentiment of a conversation
   * @param {String} id   ID of the conversation to update the sentiment of
   * @param {number} sentiment   New sentiment value
   */
  updateSentiment = (id, sentiment) => {
    console.log("FirebaseService.js id,", id);
    console.log("FirebaseService.js sentiment,", sentiment);

    return this.db.ref(`conversation/${id}`).update({
      sentiment: sentiment
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
