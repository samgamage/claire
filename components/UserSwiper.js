import { Feather } from "@expo/vector-icons";
import lodash from "lodash";
import React, { Component } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { Button, Icon } from "react-native-ui-kitten";
import uuid from "uuid";

// demo purposes only
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const LikeIcon = style => <Icon {...style} name="heart-outline" />;

const NotLikeIcon = style => <Icon {...style} name="close-outline" />;

export default class UserSwiper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: this.props.users,
      swipedAllCards: false,
      swipeDirection: "",
      cardIndex: 0
    };
  }

  renderCard = (user, index) => {
    return (
      <View style={styles.card}>
        {user && (
          <React.Fragment>
            <Text style={styles.text}>
              {user.name} - {user.age}
            </Text>
            <Text>{user.bio}</Text>
          </React.Fragment>
        )}
      </View>
    );
  };

  onSwiped = async (type, index) => {
    const uid = this.props.firebase.auth.currentUser.uid;
    const cardUser = this.state.cards[index];
    await this.props.firebase
      .userSeen(uid, cardUser.id)
      .set({ id: cardUser.id });
    if (type === 1) {
      const swipedRef = this.props.firebase.userSwiped(uid, cardUser.id);
      await swipedRef.set({ id: cardUser.id });
      if (cardUser.swiped) {
        console.log(
          lodash.findIndex(
            Object.keys(cardUser.swiped).map(key => cardUser.swiped[key].id),
            sid => sid === uid
          )
        );
        const matched =
          lodash.findIndex(
            Object.keys(cardUser.swiped).map(key => cardUser.swiped[key].id),
            sid => sid === uid
          ) !== -1;
        if (matched) {
          const conversation = {
            id: uuid.v4(),
            user1: uid,
            user2: cardUser.id
          };
          await this.props.firebase.conversation(uid).set(conversation);
        }
      }
    }
  };

  onSwipedAllCards = () => {
    this.setState({
      swipedAllCards: true
    });
  };

  swipeLeft = () => {
    this.swiper.swipeLeft();
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.swipedAllCards && this.state.cards.length > 0 ? (
          <Swiper
            ref={swiper => {
              this.swiper = swiper;
            }}
            useViewOverflow={Platform.OS === "ios"}
            onSwipedLeft={index => this.onSwiped(0, index)}
            onSwipedRight={index => this.onSwiped(1, index)}
            onTapCard={this.swipeLeft}
            cards={this.state.cards}
            cardIndex={this.state.cardIndex}
            renderCard={this.renderCard}
            onSwipedAll={this.onSwipedAllCards}
            backgroundColor="#fff"
            cardVerticalMargin={20}
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: {
                    backgroundColor: "black",
                    borderColor: "black",
                    color: "white",
                    borderWidth: 1
                  },
                  wrapper: {
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "flex-start",
                    marginTop: 30,
                    marginLeft: -30
                  }
                }
              },
              right: {
                title: "LIKE",
                style: {
                  label: {
                    backgroundColor: "black",
                    borderColor: "black",
                    color: "white",
                    borderWidth: 1
                  },
                  wrapper: {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    marginTop: 30,
                    marginLeft: 30
                  }
                }
              }
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
          />
        ) : (
          <View style={styles.alignCenter}>
            <Image source={require("../assets/empty.png")} />
            <Text style={{ fontFamily: "avenir-next-bold" }}>
              No users found
            </Text>
          </View>
        )}
        {!this.state.swipedAllCards && this.state.cards.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: Dimensions.get("screen").height / 2 + 20,
              margin: 20,
              flex: 1,
              width: Dimensions.get("screen").width - 40,
              flexDirection: "row",
              justifyContent: "space-around"
            }}
          >
            <Button
              icon={LikeIcon}
              onPress={() => {
                this.onSwiped("right", this.state.cardIndex);
                this.swiper.swipeRight();
              }}
            >
              <Feather name="heart" />
            </Button>
            <Button
              icon={NotLikeIcon}
              onPress={() => {
                this.onSwiped("left", this.state.cardIndex);
                this.swiper.swipeLeft();
              }}
            >
              <Feather name="heart" />
            </Button>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    flexDirection: "column",
    marginBottom: 49
  },
  alignCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    borderRadius: 4,
    padding: 16,
    borderWidth: 2,
    flex: 1,
    maxHeight: Dimensions.get("screen").height / 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    backgroundColor: "white"
  },
  text: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent"
  }
});
