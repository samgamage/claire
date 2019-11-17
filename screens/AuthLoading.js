import React from "react";
import { AsyncStorage, View } from "react-native";
import { Spinner } from "react-native-ui-kitten";
import { withFirebase } from "../firebase/FirebaseContext";

class AuthLoadingScreen extends React.Component {
  async componentDidMount() {
    const userTokenFromStorage = await AsyncStorage.getItem("userToken");
    const parsedTokenFromStorage = JSON.parse(userTokenFromStorage);
    if (parsedTokenFromStorage && parsedTokenFromStorage.length > 0) {
      this.props.navigation.navigate("Root");
      return;
    }
    const user = this.props.firebase.auth.currentUser;

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(user ? "Root" : "Login");
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </View>
    );
  }
}

export default withFirebase(AuthLoadingScreen);
