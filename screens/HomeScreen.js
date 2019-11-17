import React from "react";
import { View } from "react-native";
import { Text } from "react-native-ui-kitten";
import SignOut from "../components/SignOut";
import { withFirebase } from "../firebase/FirebaseContext";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Text>Home</Text>
        <SignOut
          firebase={this.props.firebase}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}

export default withFirebase(Home);
