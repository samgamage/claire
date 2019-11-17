import React from "react";
import { View } from "react-native";
import { Text } from "react-native-ui-kitten";

class Messages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [] // messages array
    };
  }

  render() {
    return (
      <View>
        <Text>Messages</Text>
      </View>
    );
  }
}

export default Messages;
