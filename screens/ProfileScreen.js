import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Layout, Spinner, Text } from "react-native-ui-kitten";
import SignOut from "../components/SignOut";
import { withFirebase } from "../firebase/FirebaseContext";

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    const uid = await this.props.firebase.getCurrentUser();
    console.log(uid);
    this.props.firebase.user(uid).once("value", snapshot => {
      const user = snapshot.val();
      this.setState({ isLoading: false, user });
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <Spinner />
        </View>
      );
    }

    const profileData = [{ title: "Name" }];
    return (
      <Layout style={styles.root}>
        {this.state.user && (
          <React.Fragment>
            <Layout
              style={{
                ...styles.listItem,
                borderTopWidth: 0
              }}
            >
              <Text style={styles.boldText}>Name</Text>
              <Text style={styles.text}>{this.state.user.name}</Text>
            </Layout>
            <Layout style={styles.listItem}>
              <Text style={styles.boldText}>Age</Text>
              <Text style={styles.text}>{this.state.user.age}</Text>
            </Layout>
            <Layout style={styles.listItem}>
              <Text style={styles.boldText}>Gender</Text>
              <Text style={styles.text}>
                {this.state.user.gender === 1 ? "Male" : "Female"}
              </Text>
            </Layout>
            <Layout style={styles.listItem}>
              <Text style={styles.boldText}>Bio</Text>
              <Text style={styles.text}>{this.state.user.bio}</Text>
            </Layout>
          </React.Fragment>
        )}
        <SignOut
          firebase={this.props.firebase}
          navigation={this.props.navigation}
        />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    margin: 20
  },
  listItem: {
    borderColor: "#d6d7da",
    borderStyle: "solid",
    borderTopWidth: 1,
    padding: 8
  },
  text: {
    fontFamily: "avenir-next-regular"
  },
  boldText: {
    fontFamily: "avenir-next-bold"
  }
});
const WrappedComponent = withFirebase(ProfileScreen);

WrappedComponent.navigationOptions = ({ navigation }) => ({
  headerTitle: <Text style={{ fontFamily: "avenir-next-bold" }}>Profile</Text>,
  headerLeft: (
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
      }}
    >
      <Feather name="arrow-left" size={24} style={{ marginLeft: 16 }} />
    </TouchableOpacity>
  )
});

export default WrappedComponent;
