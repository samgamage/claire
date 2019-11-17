import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Spinner, Text } from "react-native-ui-kitten";
import SignOut from "../components/SignOut";
import { withFirebase } from "../firebase/FirebaseContext";

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    const uid = await this.props.firebase.getCurrentUser();
    console.log(uid);
    this.props.firebase.user(uid).on("value", snapshot => {
      const user = snapshot.val();
      this.setState({ isLoading: false, user });
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Spinner />
        </View>
      );
    }

    return (
      <View>
        {this.state.user && (
          <React.Fragment>
            <Text>Name: {this.state.user.name}</Text>
            <Text>Age: {this.state.user.age}</Text>
            <Text>
              Gender: {this.state.user.gender === 1 ? "Male" : "Female"}
            </Text>
            <Text>Bio: {this.state.user.bio}</Text>
          </React.Fragment>
        )}
        <SignOut
          firebase={this.props.firebase}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}

const WrappedComponent = withFirebase(ProfileScreen);

WrappedComponent.navigationOptions = ({ navigation }) => ({
  headerLeft: (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
      }}
    >
      <Feather name="arrow-left" size={24} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  )
});

export default WrappedComponent;
