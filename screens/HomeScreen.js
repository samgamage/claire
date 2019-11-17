import React from "react";
import { View } from "react-native";
import { withFirebase } from "../firebase/FirebaseContext";

const Home = () => {
  return <View>Home</View>;
};

export default withFirebase(Home);
