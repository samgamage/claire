import React from "react";
import { Spinner } from "react-native-ui-kitten";
import styled from "styled-components";

const Loading = () => {
  return (
    <AlignCenter>
      <Spinner />
    </AlignCenter>
  );
};

const AlignCenter = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default Loading;
