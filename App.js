import { light as lightTheme, mapping } from "@eva-design/eva";
import React from "react";
import { ApplicationProvider } from "react-native-ui-kitten";
import FirebaseContext from "./firebase/FirebaseContext";
import Firebase from "./firebase/FirebaseService";
import AppNavigator from "./navigators/AppNavigator";

const App = () => {
  return (
    <FirebaseContext.Provider value={new Firebase()}>
      <ApplicationProvider mapping={mapping} theme={lightTheme}>
        <AppNavigator />
      </ApplicationProvider>
    </FirebaseContext.Provider>
  );
};

export default App;
