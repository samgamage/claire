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

// takes props 'url', 'id' and 'sentiment'
class Picture extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { sentiment, url } = this.props;

    // the scale for blurRadius changes depending on the OS
    let min;
    let max;
    if (Platform.OS === "ios") {
      max = 130;
      min = 0;
    } else {
      max = 10;
      min = 0;
    }

    // sentiment from -1 to 1 scales linearly with blur amount from min to max
    // first add 1 to sentiment to get x where 0 <= x < 2
    // then multiply by max to get y where 0 <= y < max
    // finally, subtract from max to invert for blurRadius
    const thisBlurAmount =
      sentiment == null ? max : max - (sentiment + 1) * (max / 2);

    return (
      <Layout style={{ flex: 1 }}>
        {url ? (
          <Image
            source={{
              uri: url
            }}
            style={{
              height: "100%"
            }}
            blurRadius={thisBlurAmount}
          />
        ) : null}
      </Layout>
    );
  }
}

class MessageRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { userIsSender, text } = this.props; // use this later.
    return userIsSender ? (
      <View
        style={{
          ...styles.messageContainer,
          width: "100%",
          alignSelf: "flex-end"
        }}
      >
        <Text style={styles.rightMessage}>{text}</Text>
      </View>
    ) : (
      <View style={styles.messageContainer}>
        <Text style={styles.leftMessage}>{text}</Text>
      </View>
    );
  }
}

class SendMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: ""
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
    const { conversationId, firebase, messageListRef } = this.props;
    setTimeout(() => {
      messageListRef.scrollToEnd();
    }, 50);

    // ignore empty messages
    if (message.trim() == "") {
      return;
    }

    await firebase.uploadMessage(message, conversationId);

    // clear user input
    this.setState({
      message: ""
    });
  }

  render() {
    const { message } = this.state;
    return (
      <View style={styles.messageBox}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={message}
          autoCorrect={false}
          onChangeText={text => this.handleChangeText(text)}
        />
        <Button
          ref={ref => (this.buttonRef = ref)}
          onPress={this.handleSendMessage}
        >
          Send
        </Button>
      </View>
    );
  }
}

class MessagesContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sentiment: -1,
      otherPersonPicUrl: "",
      otherPersonId: "",

      loading: true,
      messages: []
    };

    this.updateConversationSentiment = this.updateConversationSentiment.bind(
      this
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );
  }

  async componentDidMount() {
    const { conversationId, firebase } = this.props;
    const {
      getAllMessagesListen,
      getConversationListen,
      filterMessages,
      sortMessages
    } = firebase;

    // updates messages picture when changed in db; runs once when component mounts
    getAllMessagesListen(messagesToFilter => {
      // filters out messages that don't belong to this conversation, and sorts messages by their timestamp
      let messages = sortMessages(
        filterMessages(conversationId, messagesToFilter)
      );

      this.setState(
        {
          loading: false,
          messages
        },
        () => {
          // updates conversation sentiment after getting messages.
          // though this is asynchronous, we don't necessarily have to wait/block for it.
          this.updateConversationSentiment();
        }
      );
    });

    // updates profile picture when conversation (sentiment) changes; run once when component mounts
    getConversationListen(conversationId, conversationObj => {
      if (!conversationObj || conversationObj.sentiment == null) {
        return;
      }

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
      const otherPersonPicUrl = await this.props.firebase.getProfilePic(
        this.state.otherPersonId
      );
      this.setState({ otherPersonPicUrl });
    }
  }

  // detach listeners
  componentWillUnmount() {
    const { conversationId, firebase } = this.props;
    const { detachAllMessagesListen, detachConversationListen } = firebase;
    detachAllMessagesListen();
    detachConversationListen(conversationId);
    Keyboard.removeAllListeners();
  }

  _keyboardDidShow = e => {
    setTimeout(() => {
      this.messageList.scrollToEnd();
    }, 50);
  };

  updateConversationSentiment() {
    const { messages } = this.state;
    const { conversationId, firebase } = this.props;
    const { updateSentiment } = firebase;

    // recalculates sentiment, then updates it in the DB
    getSentiment(messages).then(res => {
      const { ok, sentiment } = res;

      let score;
      if (res == null || sentiment == null || sentiment === 0) {
        score = -1;
      } else {
        score = sentiment.score;
        // let maybeDoSomethingWithThis = sentiment.magnitude;
      }

      return updateSentiment(conversationId, score);
    });
  }

  render() {
    const { loading, messages, sentiment, otherPersonPicUrl } = this.state;
    const { firebase, conversationId } = this.props;
    const { uid } = firebase.auth.currentUser;

    if (loading) {
      return (
        <Layout style={styles.alignCenter}>
          <Spinner />
        </Layout>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, marginBottom: 49 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 65 : 80}
      >
        <Picture sentiment={sentiment} url={otherPersonPicUrl} />
        <ScrollView
          style={{
            flex: 0.4,
            borderColor: "gray",
            borderTopWidth: 1,
            borderBottomWidth: 1
          }}
          ref={ref => {
            this.messageList = ref;
            ref && ref.scrollToEnd();
          }}
        >
          <FlatList
            style={{ flex: 1 }}
            data={messages}
            renderItem={({ item }) => (
              <MessageRow
                text={item.content}
                userIsSender={uid == item.sender}
              />
            )}
            keyExtractor={item => item.id}
          />
        </ScrollView>
        <SendMessage
          messageListRef={this.messageList}
          conversationId={conversationId}
          firebase={firebase}
        />
      </KeyboardAvoidingView>
    );
  }
}

// contains logic for whether we should even render messages content
class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      shouldRender: false,
      conversationId: null
    };
  }

  async componentDidMount() {
    const { shouldRender } = this.state;
    const { firebase } = this.props;
    const { getConversationsListen } = firebase;
    const userRef = this.props.firebase.user(firebase.auth.currentUser.uid);
    const userSnapshot = await userRef.once("value");
    const user = userSnapshot.val();

    getConversationsListen(conversations => {
      const { shouldRender } = this.state;
      if (conversations == null || conversations.length === 0) {
        this.setState({
          shouldRender: false,
          loading: false,
          conversationId: null
        });
      } else {
        const [thisConversation] = conversations.filter(
          conversation => conversation.id === user.conversation
        );
        this.setState({
          shouldRender: true,
          loading: false,
          conversationId: thisConversation.id
        });
      }
      // if (
      //   (conversations == null || conversations.length === 0) &&
      //   shouldRender == true
      // ) {
      //   this.setState({
      //     shouldRender: false,
      //     loading: false,
      //     conversationId: null
      //   });
      // } else if (
      //   conversations &&
      //   conversations.length > 0 &&
      //   shouldRender == false
      // ) {
      //   const thisConversationId = conversations[0].id;
      //   this.setState({
      //     shouldRender: true,
      //     loading: false,
      //     conversationId: thisConversationId
      //   });
      // } else {
      //   this.setState({
      //     shouldRender: false,
      //     loading: false,
      //     conversationId: null
      //   });
      // }
    });
  }

  render() {
    const { shouldRender, loading, conversationId } = this.state;
    const { firebase } = this.props;
    // const { uid } = firebase.auth.currentUser;

    let ourView;
    if (loading) {
      ourView = <Loading />;
    } else if (shouldRender === false) {
      ourView = (
        <View style={styles.alignCenter}>
          <Text style={{ fontFamily: "avenir-next-regular" }}>
            You haven't matched with anyone yet. Go meet some people!
          </Text>
        </View>
      );
    } else {
      ourView = (
        <MessagesContent conversationId={conversationId} firebase={firebase} />
      );
    }

    return <View style={{ flex: 1 }}>{ourView}</View>;
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

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center",
    justifyContent: "center"
  },
  messageBox: {
    flexDirection: "row",
    height: 40
  },
  messageInput: {
    height: 40,
    flexGrow: 1,
    maxWidth: Dimensions.get("window").width - 75
  },
  rightMessage: {
    textAlign: "right",
    backgroundColor: "#FFC107",
    borderRadius: 16,
    padding: 6,
    maxWidth: "70%",
    alignSelf: "flex-end",
    fontFamily: "avenir-next-regular"
  },
  leftMessage: {
    textAlign: "left",
    borderRadius: 16,
    backgroundColor: "lightgray",
    padding: 6,
    maxWidth: "70%",
    alignSelf: "flex-start",
    fontFamily: "avenir-next-regular"
  },
  messageContainer: {
    padding: 10
  }
});

export default withFirebase(Messages);
