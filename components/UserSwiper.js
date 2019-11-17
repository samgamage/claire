import lodash from "lodash";
import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Swiper from "react-native-deck-swiper";

// demo purposes only
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

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
    if (type === 1) {
      const uid = this.props.firebase.auth.currentUser.uid;
      const cardUser = this.state.cards[index];
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
        {!this.state.swipedAllCards && (
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
        )}
        {/* <Button onPress={() => this.swiper.swipeBack()} title="Swipe Back" /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  card: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    backgroundColor: "white"
  },
  text: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent"
  },
  done: {
    textAlign: "center",
    fontSize: 30,
    color: "white",
    backgroundColor: "transparent"
  }
});
