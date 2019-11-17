import React from "react";
import { View } from "react-native";
import { Text } from "react-native-ui-kitten";
import SignOut from "../components/SignOut";
import { withFirebase } from "../firebase/FirebaseContext";

const Home = ({ firebase, navigation }) => {
  return (
    <View>
      <Text>Home</Text>
      <SignOut firebase={firebase} navigation={navigation} />
    </View>
  );
};

export default withFirebase(Home);
