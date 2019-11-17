import { Formik } from "formik";
import React from "react";
import { SafeAreaView } from "react-native";
import { Button, Text } from "react-native-ui-kitten";
import styled from "styled-components";
import * as Yup from "yup";
import { withFirebase } from "../firebase/FirebaseContext";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("This field is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("This field is required")
});

class LoginScreen extends React.Component {
  onLogin = async (email, password) => {
    const user = await this.props.firebase.signInWithEmail(email, password);
    if (user) {
      this.props.navigation.navigate("AuthLoading");
    }
  };

  render() {
    return (
      <Container>
        <RootContainer>
          <SafeAreaView>
            <Text>Claire</Text>
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={values => this.onLogin(values.email, values.password)}
              validationSchema={LoginSchema}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                <React.Fragment>
                  <Input
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardAppearance="dark"
                    autoCompleteType="email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                  {errors.email && <Text>{errors.email}</Text>}
                  <Input
                    autoCompleteType="password"
                    autoCapitalize="none"
                    value={values.password}
                    placeholder="Password"
                    keyboardAppearance="dark"
                    onChangeText={handleChange("password")}
                    secureTextEntry={true}
                    onBlur={handleBlur("password")}
                  />
                  {errors.email && <Text>{errors.password}</Text>}
                  <Button
                    style={{ marginTop: 16 }}
                    onPress={handleSubmit}
                    mode="contained"
                  >
                    Log In
                  </Button>
                </React.Fragment>
              )}
            </Formik>
          </SafeAreaView>
        </RootContainer>
      </Container>
    );
  }
}

const WrappedComponent = withFirebase(LoginScreen);

WrappedComponent.navigationOptions = {
  header: null
};

export default WrappedComponent;

const Input = styled.TextInput`
  border-radius: 5px;
  border: 1px solid gray;
  padding: 10px;
  width: 100%;
  min-width: 300px;
  margin-top: 16px;
`;

const RootContainer = styled.View`
  margin-top: 32px;
  margin-bottom: 16px;
`;

const FieldItem = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Container = styled.View`
  padding: 8px;
  background-color: #f0f3f5;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
