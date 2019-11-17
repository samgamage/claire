import React from "react";
import styled from "styled-components";
import { Button } from "react-native-ui-kitten";

const Loading = () => {
  return (
    <ViewS>
      <TextS>Loading...</TextS>
    </ViewS>
  );
};

const ViewS = styled.View`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const TextS = styled.Text`
  font-size: 32px;
`;

export default Loading;
