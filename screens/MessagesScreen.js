import React from "react";
import PropTypes from "prop-types";
import {
  FlatList,
  View
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
    const { getAllMessages, filterMessages, sortMessages } = this.props.firebase;

    const messagesToFilter = await getAllMessages();

    // filters out messages that don't belong to this conversation, and sorts messages by their timestamp
    let messages = sortMessages(filterMessages(
      conversationId,
      messagesToFilter
    ));

    this.setState({
      loading: false,
      messages
    });
  }

  render() {
    const { loading, messages } = this.state;
    const { uid } = this.props.firebase.auth.currentUser;

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
          </View>}
      </View>
    );
  }
}

MessageRow.propTypes = {
  userIsSender: PropTypes.bool,
  text: PropTypes.string.isRequired
};

export default withFirebase(Messages);
