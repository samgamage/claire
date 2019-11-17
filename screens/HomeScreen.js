import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Spinner, Text } from "react-native-ui-kitten";
import { withFirebase } from "../firebase/FirebaseContext";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    const uid = await this.props.firebase.getCurrentUser();
    const location = this._getLocationAsync(uid);
    const userRef = this.props.firebase.user(uid);
    const userSnapshot = await userRef.once("value");
    const user = userSnapshot.val();

    const users = await this.props.firebase.getAllUsersWithGenderAndDistanceAway(
      user,
      user.genderWant,
      3218.69
    );
    console.log(users);
    this.setState({ user, isLoading: false });
  }

  _getLocationAsync = async uid => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        error: {
          message: "Permission to access location was denied"
        }
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    await this.props.firebase.user(uid).update({ location });
    this.setState({ isLoading: false });
    return location;
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Spinner />
        </View>
      );
    }

    if (this.state.error) {
      return (
        <View>
          <Text>{error.message}</Text>
        </View>
      );
    }

    return (
      <View>
        <Text>Home</Text>
      </View>
    );
  }
}

const WrappedComponent = withFirebase(Home);

WrappedComponent.navigationOptions = ({ navigation }) => ({
  headerTitle: <Text>🔥 Flame</Text>,
  headerRight: (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Profile");
      }}
    >
      <Feather name="user" size={24} style={{ marginRight: 8 }} />
    </TouchableOpacity>
  )
});

export default WrappedComponent;
