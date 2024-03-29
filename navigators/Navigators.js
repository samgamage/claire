import { Feather } from "@expo/vector-icons";
import React from "react";
import { createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import AuthLoading from "../screens/AuthLoading";
import HomeScreen from "../screens/HomeScreen";
import LeaveConversationScreen from "../screens/LeaveConversation";
import LoginScreen from "../screens/LoginScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Profile: ProfileScreen
});

HomeStack.navigationOptions = () => {
  return {
    tabBarIcon: ({ focused }) => (
      <Feather name="home" size={26} color={focused ? "#FFA726" : "#E0E0E0"} />
    )
  };
};

const MessagesStack = createStackNavigator({
  Messages: MessagesScreen,
  LeaveConversation: LeaveConversationScreen
});

MessagesStack.navigationOptions = () => {
  return {
    tabBarIcon: ({ focused }) => (
      <Feather
        name="message-circle"
        size={26}
        color={focused ? "#FFA726" : "#E0E0E0"}
      />
    )
  };
};

const LeaveConversationStack = createStackNavigator({
  LeaveConversation: LeaveConversationScreen
});

LeaveConversationStack.navigationOptions = {
  tabBarEnabled: false
};

const LoginStack = createStackNavigator(
  {
    Login: LoginScreen
  },
  { tabBarVisible: false }
);

const TabNavigator = createBottomTabNavigator(
  {
    HomeStack,
    MessagesStack
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
