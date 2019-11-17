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
    const { side, text } = this.props; // use this later.
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>
          {text}
        </Text>
      </View>
    )
  }
}

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      messages: []
    };
  }

  componentDidMount() {

  }

  render() {
    const { loading, messages } = this.state;

    return (
      <View>
        { loading
          ? <Loading />
          : <View>
              <FlatList
                data={messages}
                renderItem={({ item }) => <MessageRow text={item.text} side="right" />}
                keyExtractor={item => item.id}
              />
          </View>}
      </View>
    );
  }
}

MessageRow.propTypes = {
  side: PropTypes.string, // 'right' or blank for right side,  'left' for left side
};

export default withFirebase(Messages);
