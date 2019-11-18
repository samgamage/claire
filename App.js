import { light, mapping } from "@eva-design/eva";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import * as Font from "expo-font";
import { Root } from "native-base";
import React from "react";
import { YellowBox } from "react-native";
import { ApplicationProvider, IconRegistry } from "react-native-ui-kitten";
import FirebaseContext from "./firebase/FirebaseContext";
import Firebase from "./firebase/FirebaseService";
import AppNavigator from "./navigators/AppNavigator";

const theme = {
  ...light,
  "color-primary-100": "#FFECB3",
  "color-primary-200": "#FFE082",
  "color-primary-300": "#FFD54F",
  "color-primary-400": "#FFCA28",
  "color-primary-500": "#FFC107",
  "color-primary-600": "#FFB300",
  "color-primary-700": "#FFA000",
  "color-primary-800": "#FF8F00",
  "color-primary-900": "#FF6F00"
};

class App extends React.Component {
  state = {
    isLoading: true
  };

  async componentDidMount() {
    await Font.loadAsync({
      "avenir-next-regular": require("./assets/AvenirNextLTPro-Regular.otf")
    });

    await Font.loadAsync({
      "avenir-next-medium": require("./assets/AvenirNextLTPro-MediumCn.otf")
    });

    await Font.loadAsync({
      "avenir-next-bold": require("./assets/AvenirNextLTPro-Bold.otf")
    });

    // hide the warning things
    YellowBox.ignoreWarnings(["Setting a timer"]);

    this.setState({ isLoading: false });
  }

  render() {
    if (this.state.isLoading) {
      return null;
    }
    return (
      <FirebaseContext.Provider value={new Firebase()}>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={theme}>
          <Root>
            <AppNavigator />
          </Root>
        </ApplicationProvider>
      </FirebaseContext.Provider>
    );
  }
}

export default App;
