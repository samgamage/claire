import React, { Component } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
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

  onSwiped = type => {
    console.log(`on swiped ${type}`);
  };

  onSwipedRight = (card, index) => {
    console.log("Swiped right");
  };

  onSwipedLeft = (card, index) => {
    console.log("Swiped left");
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
    console.log(this.state.swipedAllCards);
    console.log(this.state.cards);
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.swipedAllCards && (
          <Swiper
            ref={swiper => {
              this.swiper = swiper;
            }}
            onSwipedLeft={this.onSwipedLeft}
            onSwipedRight={this.onSwipedRight}
            onTapCard={this.swipeLeft}
            cards={this.state.cards}
            cardIndex={this.state.cardIndex}
            cardVerticalMargin={80}
            renderCard={this.renderCard}
            onSwipedAll={this.onSwipedAllCards}
            infinite={false}
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
        {this.state.swipedAllCards && <Text>No more</Text>}
        {/* <Button onPress={() => this.swiper.swipeBack()} title="Swipe Back" /> */}
      </SafeAreaView>
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
