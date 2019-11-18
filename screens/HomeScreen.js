import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import React from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Layout, Spinner, Text } from "react-native-ui-kitten";
import UserSwiper from "../components/UserSwiper";
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
    this._getLocationAsync(uid);
    const userRef = this.props.firebase.user(uid);
    await userRef.once("value", async snapshot => {
      const user = snapshot.val();

      const users = await this.props.firebase.getAllUsersWithGenderAndDistanceAway(
        user,
        user.genderWant,
        3218.69 // 2 miles in meters,
      );
      console.log(users);
      this.setState({ user, users, isLoading: false });
    });
  }

  // componentWillUnmount() {
  //   this.props.firebase.user(this.state.user.id).off();
  // }

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
  };

  render() {
    if (this.state.isLoading) {
      return (
        <Layout style={styles.alignCenter}>
          <Spinner />
        </Layout>
      );
    }

    if (this.state.error) {
      return (
        <Layout>
          <Text>{error.message}</Text>
        </Layout>
      );
    }

    return (
      <Layout style={{ flex: 1, backgroundColor: "#fff" }}>
        <UserSwiper
          user={this.state.user}
          firebase={this.props.firebase}
          users={this.state.users}
        />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  alignCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

const WrappedComponent = withFirebase(Home);

WrappedComponent.navigationOptions = ({ navigation }) => ({
  headerTitle: <Text style={{ fontFamily: "avenir-next-bold" }}>Claire</Text>,
  headerRight: (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Profile");
      }}
    >
      <Feather name="user" size={24} style={{ marginRight: 16 }} />
    </TouchableOpacity>
  )
});

export default WrappedComponent;
