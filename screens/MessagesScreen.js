import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  FlatList,
  View,
  TextInput
} from "react-native";
import { Text } from "react-native-ui-kitten";
import Loading from '../components/Loading';
import { withFirebase } from "../firebase/FirebaseContext";

class MessageRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { userIsSender, text } = this.props; // use this later.
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>
          { userIsSender
            ? `You said ${text}`
            : `They said ${text}`
          }
        </Text>
      </View>
    )
  }
}

class SendMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: ''
    };

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }

  handleChangeText(str) {
    this.setState({
      message: str
    });
  }

  async handleSendMessage() {
    const { message } = this.state;
    const { conversationId, firebase } = this.props;

    // ignore empty messages
    if (message.trim() == '') {
      return;
    }
    await firebase.uploadMessage(
      message,
      conversationId
    );
    this.setState({
      message: ''
    });
  }

  render() {
    const { message } = this.state;
    return (
      <View>
        <TextInput
          style={{height: 40}}
          placeholder="Type a message..."
          value={message}
          onChangeText={(text) => this.handleChangeText(text)}
        />
        <Button
          onPress={this.handleSendMessage}
          title="Send Message"
        />
      </View>
    )    
  }
}

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      // hardcode the conversationId for now. Until we start getting it from parent (most likely will be via props)
      conversationId: 'convoId1',
      
      loading: true,
      messages: [],
    };
  }

  async componentDidMount() {
    const { conversationId } = this.state;
    const { getAllMessages, getAllMessagesListen, filterMessages, sortMessages } = this.props.firebase;

    // const messagesToFilter = await getAllMessages();
    
    getAllMessagesListen((messagesToFilter) => {
      // filters out messages that don't belong to this conversation, and sorts messages by their timestamp
      let messages = sortMessages(filterMessages(
        conversationId,
        messagesToFilter
      ));

      this.setState({
        loading: false,
        messages
      });
    });
  }

  render() {
    const { loading, messages, conversationId } = this.state;
    const { firebase } = this.props;
    const { uid } = firebase.auth.currentUser;

    return (
      <View>
        { loading
          ? <Loading />
          : <View>
              <FlatList
                data={messages}
                renderItem={({ item }) => <MessageRow text={item.content} userIsSender={uid == item.sender} />}
                keyExtractor={item => item.id}
              />
              <SendMessage
                conversationId={conversationId}
                firebase={firebase}
              />
          </View>
        }
      </View>
    );
  }
}

MessageRow.propTypes = {
  userIsSender: PropTypes.bool,
  text: PropTypes.string.isRequired
};

// for some reason these proptypes crash the app...?!?!?
// SendMessage.propTypes = {
//   conversationId: PropTypes.String.isRequired,
//   firebase: PropTypes.object
// };

export default withFirebase(Messages);
