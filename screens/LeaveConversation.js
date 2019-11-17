import PropTypes from "prop-types";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { Button, Layout, Spinner, Text } from "react-native-ui-kitten";
import { getSentiment } from "../api/api";
import Loading from "../components/Loading";
import { withFirebase } from "../firebase/FirebaseContext";

// contains logic for whether we should even render messages content
class LeaveConversation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.handleNo = this.handleNo.bind(this);
    this.handleYes = this.handleYes.bind(this);
  }

  async componentDidMount() {

  }

  async handleNo() {
    this.props.navigation.navigate('MessagesScreen');
  }

  async handleYes() {
    const {
      auth
    } = this.props.firebase;

    // get conversation id from current user
    const uid = auth.currentUser.uid;
    let snapshot = await firebase.db.ref(`users/${uid}`).once('value');
    let userObj = snapshot.val();
    let conversationId = userObj.conversation;

    // get this conversation's users
    let snapshot2 = await firebase.db.ref(`conversation/${conversationId}`).once('value');
    let convoObj = snapshot2.val();
    const { user1, user2 } = convoObj;

    // go to both users and delete
    await firebase.db.ref(`users/${user1}/conversation`).remove();
    await firebase.db.ref(`users/${user2}/conversation`).remove();

    // delete the conversation itself
    await firebase.db.ref(`conversation/${conversationId}`).remove();
  }

  render() {
    return (
      <View>
        <Text>Are you sure? This isn't reversible, and you won't be able to speak to them again!</Text>
        <Button onPress={this.handleYes}>Yeah</Button>
        <Button onPress={this.handleNo}>Nope</Button>
      </View>
    );
  }
}

const WrappedComponent = withFirebase(LeaveConversation);

export default WrappedComponent;
