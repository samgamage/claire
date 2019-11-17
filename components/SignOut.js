import React from "react";
import { Button } from "react-native-ui-kitten";

const SignOut = ({ firebase, navigation }) => {
  return (
    <Button
      onPress={async () => {
        await firebase.signOut();
        navigation.navigate("AuthLoading");
      }}
    >
      Sign out
    </Button>
  );
};

export default SignOut;
