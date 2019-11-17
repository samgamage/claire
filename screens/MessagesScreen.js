import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  FlatList,
  View,
  TextInput,
  Image
} from "react-native";
import { Text } from "react-native-ui-kitten";
import Loading from '../components/Loading';
import { withFirebase } from "../firebase/FirebaseContext";
import { getSentiment } from "../api/api";

// takes props 'url', 'id' and 'sentiment'
class Picture extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { sentiment, url } = this.props;

    console.log('SENTIMENT:', sentiment);

    // sentiment from -1 to 1 scales linearly with blur amount from 1 to 10
    // first add 1 to sentiment to get x where 0 < x < 2
    // then multiply by 5 to get y where 0 < y < 10
    // finally, subtract from 10 to invert for blurRadius
    const thisBlurAmount = 10 - ((sentiment + 1) * 5);

    return (
      <View>
        { url
          ? <Image
            source={{
              uri: url
            }}
            style={{
              width: 200,
              height: 200
            }}
            blurRadius={thisBlurAmount}
            resizeMode='cover'
          />
          : null }
      </View>
    );
  }
}

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

    // clear user input
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
      sentiment: -1,
      otherPersonPicUrl: '',
      otherPersonId: '',
      
      loading: true,
      messages: [],
    };

    this.updateConversationSentiment = this.updateConversationSentiment.bind(this);
  }

  async componentDidMount() {
    const { conversationId } = this.state;
    const {
      getAllMessages,
      getAllMessagesListen,
      getConversationListen,
      filterMessages,
      sortMessages
    } = this.props.firebase;

    
    // updates messages picture when changed in db; run once when component mounts
    getAllMessagesListen((messagesToFilter) => {
      // filters out messages that don't belong to this conversation, and sorts messages by their timestamp
      let messages = sortMessages(filterMessages(
        conversationId,
        messagesToFilter
      ));

      this.setState({
        loading: false,
        messages
      }, () => {
        // updates conversation sentiment after getting messages.
        // though this is asynchronous, we don't necessarily have to wait/block for it.
        this.updateConversationSentiment();
      });
    });

    // updates profile picture when conversation (sentiment) changes; run once when component mounts
    getConversationListen(conversationId, (conversationObj) => {
      const { sentiment, user1, user2 } = conversationObj;

      // determine which ID belongs to current user
      let otherPersonId;
      if (this.props.firebase.auth.currentUser.uid == user1) {
        otherPersonId = user1;
      } else {
        otherPersonId = user2;
      }

      this.setState({
        sentiment,
        otherPersonId
      });
    });
  }

  // update profile picture if necessary
  async componentDidUpdate(prevProps, prevState) {
    if (this.state.otherPersonId !== prevState.otherPersonId) {
      const otherPersonPicUrl = await this.props.firebase.getProfilePic(this.state.otherPersonId);
      this.setState({ otherPersonPicUrl });
    }
  }

  updateConversationSentiment() {
    const { messages, conversationId } = this.state;
    const { updateSentiment } = this.props.firebase;

    // recalculates sentiment, then updates it in the DB
    getSentiment(messages).then((res) => {
      const { ok, sentiment } = res;
      if (!ok) {
        return;
      }
      let score;
      if (sentiment === 0) {
        score = -1;
      } else {
        score = sentiment.score;
        // let maybeDoSomethingWithThis = sentiment.magnitude;
      }
      return updateSentiment(conversationId, score);
    });
  }

  render() {
    const {
      loading,
      messages,
      conversationId,
      sentiment,
      otherPersonPicUrl
    } = this.state;
    const { firebase } = this.props;
    const { uid } = firebase.auth.currentUser;

    return (
      <View>
        { loading
          ? <Loading />
          : <View>
              <Picture
                sentiment={sentiment}
                url={otherPersonPicUrl}
              />
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
