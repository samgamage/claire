import React from "react";
import { View } from "react-native";
import { Button, Text } from "react-native-ui-kitten";
import { withFirebase } from "../firebase/FirebaseContext";

// contains logic for whether we should even render messages content
class LeaveConversation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleNo = this.handleNo.bind(this);
    this.handleYes = this.handleYes.bind(this);
  }

  async componentDidMount() {}

  async handleNo() {
    this.props.navigation.goBack();
  }

  async handleYes() {
    const { auth } = this.props.firebase;

    // get conversation id from current user
    const uid = auth.currentUser.uid;
    let snapshot = await this.props.firebase.db
      .ref(`users/${uid}`)
      .once("value");
    let userObj = snapshot.val();
    let conversationId = userObj.conversation;

    // get this conversation's users
    let snapshot2 = await this.props.firebase.db
      .ref(`conversation/${conversationId}`)
      .once("value");
    let convoObj = snapshot2.val();
    const { user1, user2 } = convoObj;

    // go to both users and delete
    await this.props.firebase.db.ref(`users/${user1}/conversation`).remove();
    await this.props.firebase.db.ref(`users/${user2}/conversation`).remove();

    // delete the conversation itself
    await this.props.firebase.db.ref(`conversation/${conversationId}`).remove();
    this.props.navigation.navigate("Home");
  }

  render() {
    return (
      <View>
        <Text>
          Are you sure? This isn't reversible, and you won't be able to speak to
          them again!
        </Text>
        <Button onPress={this.handleYes}>Yeah</Button>
        <Button onPress={this.handleNo}>Nope</Button>
      </View>
    );
  }
}

const WrappedComponent = withFirebase(LeaveConversation);

export default WrappedComponent;
