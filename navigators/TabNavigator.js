import { Feather } from "@expo/vector-icons";
import React from "react";
import { createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import AuthLoading from "../screens/AuthLoading";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";

const HomeStack = createStackNavigator({
  Home: HomeScreen
});

const LoginStack = createStackNavigator(
  {
    Login: LoginScreen
  },
  { tabBarVisible: false }
);

HomeStack.navigationOptions = ({ navigation }) => {
  const tabBarVisible = true;
  const routeName = navigation.state.routes[navigation.state.index].routeName;

  if (routeName === "Login") {
    tabBarVisible = false;
  }

  // define which views show navigation bar based on route name

  return {
    tabBarVisible,
    tabBarIcon: ({ focused }) => (
      <Feather
        name="home"
        size={26}
        color={focused ? Typography.activeColor : Typography.inactiveColor}
      />
    )
  };
};

const TabNavigator = createBottomTabNavigator(
  {
    HomeStack
  },
  {
    tabBarPosition: "bottom",
    animationEnabled: true,
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      showIndicator: false,
      titleStyle: {
        justifyContent: "center",
        alignItems: "center"
      },
      style: {
        borderWidth: 0,
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        borderColor: "rgb(27, 42, 51)",
        shadowColor: "red",
        elevation: 2
      },
      activeBackgroundColor: "white",
      inactiveBackgroundColor: "white",
      labelStyle: {
        fontSize: 14,
        color: "#fff",
        position: "relative",
        alignSelf: "center"
      },
      iconStyle: {
        marginBottom: 5,
        marginTop: 5
      },
      tabStyle: {
        justifyContent: "center",
        alignItems: "center"
      },
      indicatorStyle: {
        backgroundColor: "transparent"
      }
    }
  }
);

const RootStack = createStackNavigator(
  {
    Tab: TabNavigator,
    Home: HomeScreen
  },
  {
    defaultNavigationOptions: () => {
      return { header: null };
    }
  }
);

const SwitchNav = createSwitchNavigator(
  {
    Login: {
      screen: LoginStack
    },
    Root: { screen: RootStack },
    AuthLoading: { screen: AuthLoading }
  },
  {
    initialRouteName: "AuthLoading"
  }
);

export default SwitchNav;
