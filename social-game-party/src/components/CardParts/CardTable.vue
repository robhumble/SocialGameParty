<template>
  <div style="text-align: center">
    <!-- BEGIN DEBUG TOOLS _____________________________________________________________________________ -->
    <div v-if="showDebugTools">
      <div class="top-controls">
        <h1>CARD TABLE</h1>

        <v-btn @click="popDeck">Start New Deck</v-btn>

        <v-btn v-if="cardDeck" @click="shuffleDeck">...shuffle?</v-btn>

        <v-radio-group label="Deck View Types" v-model="deckViewType">
          <v-radio label="Long List" value="list"></v-radio>
          <v-radio label="Wide Scroll" value="scroll"></v-radio>
        </v-radio-group>

        <v-btn v-if="cardDeck" @click="dealACardToPlayer"
          >Deal Card To Player</v-btn
        >
      </div>

      <!-- FULL Deck -->

      <!-- List -->
      <table v-if="cardDeck && deckViewType == 'list'">
        <v-label>Deck (list)</v-label>
        <tr>
          <td>suit</td>
          <td>color</td>
          <td>value</td>
        </tr>

        <tr v-for="c in allCardsInDeck" :key="c.Suit + c.Value">
          <VisualCard
            :cardObject="c"
            :startFaceDown="true"
            @flipTargetCard="flipDeckCard($event)"
          ></VisualCard>
          <td>{{ c.Suit }}</td>
          <td>{{ c.Color }}</td>
          <td>{{ c.Value }}</td>
        </tr>
      </table>

      <!-- Horizontal Scroll -->
      <div v-if="cardDeck && deckViewType == 'scroll'" class="scroll-cards">
        <v-label>Deck (scroll)</v-label>
        <VisualCard
          v-for="c in allCardsInDeck"
          :key="c.Suit + c.Value"
          :cardObject="c"
          :startFaceDown="true"
          @flipTargetCard="flipDeckCard($event)"
        ></VisualCard>
      </div>

      <!-- HAND -->
      <div v-if="playerHand.length > 0" class="scroll-cards">
        <v-label>Player Hand (scroll)</v-label>
        <VisualCard
          v-for="c in playerHand"
          :key="c.Suit + c.Value"
          :cardObject="c"
          :startFaceDown="true"
          @flipTargetCard="flipHandCard($event)"
        ></VisualCard>
      </div>
    </div>
    <!-- END DEBUG TOOLS _____________________________________________________________________________ -->

    <!-- BEGIN REAL STUFF_____________________________________________________________________________ -->

    <div>
      <!-- Status Display -->
      <div v-if="isTurnComplete">
        <p>{{ endOfTurnMessage }}</p>
        <p v-if="showIsBust">BUST!!!!!!!</p>
      </div>

      <!-- Message -->
      <div v-if="showMessage">
        <h3 v-if="simpleMessage">{{ simpleMessage }}</h3>
        <h3 v-else-if="messageFunctionName">
          {{ getStringFromFunction(messageFunctionName) }}
        </h3>
      </div>

      <!-- Dealer Hand -->
      <div v-if="showDealerHand && dealerHand.length > 0" class="scroll-cards">
        <v-label>Dealer's Hand</v-label>
        <VisualCard
          v-for="c in dealerHand"
          :key="c.Suit + c.Value"
          :cardObject="c"
          :startFaceDown="true"
          @flipTargetCard="flipHandCard($event)"
        ></VisualCard>
      </div>

      <!-- Current Player Hand -->
      <div
        v-if="showCurrentPlayerHand && playerHand.length > 0"
        class="scroll-cards"
      >
        <v-label>Your Hand</v-label>
        <VisualCard
          v-for="c in playerHand"
          :key="c.Suit + c.Value"
          :cardObject="c"
          :startFaceDown="true"
          @flipTargetCard="flipHandCard($event)"
        ></VisualCard>
      </div>

      <!-- Controls -->
      <div v-if="!isTurnComplete">
        <v-btn v-if="showHitControl" @click="hit">Hit!</v-btn>
        <v-btn v-if="showStandControl" @click="stand">Stand!</v-btn>
      </div>
    </div>

    <!-- END REAL STUFF_____________________________________________________________________________ -->
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

import VisualCard from "@/components/CardParts/VisualCard.vue";

import DeckOfCards from "@/logic/Cards/DeckOfCards.js";
//import BlackJackGame from "@/logic/Games/BlackJackGame.js";
//import Card from "@/logic/Cards/Card.js";

export default {
  name: "CardTable",
  components: {
    VisualCard,
  },
  props: ["cardTableConfig", "gameClass"],
  data: () => ({
    //TODO: these should be props
    cardDeck: null, //The Deck
    playerHand: [], //The players cards
    dealerHand: [],

    deckViewType: "scroll",

    //cardTableConfig___________________________________________________________

    gameName: null,

    // gameClass: null,

    showDebugTools: false,

    //THESE WILL ALL BE IN THE RemoteDataGroup OBJECT IN THE VUEX STORE
    //Describe the location and name of the deck and the player hand object in the remote document...
    deckLocation: null,
    deckName: null,
    playerInfoLocation: null,
    playerInfoName: null,

    //Deck
    showContentsOfDeck: null,

    //Deck Controls

    //Hands
    showCurrentPlayerHand: null,
    showAllPlayerHands: null,

    showDealerHand: null,

    //Hand Controls
    //(these controls have a default behavior - providing a function name will call the function instead of using default behavior overriding the control)
    showHitControl: null,
    hitControlFunctionName: null,

    showStandControl: null,
    standControlFunctionName: null,

    endTurnFunctionName: null,

    // Messages
    showMessage: false,
    simpleMessage: null,
    messageFunctionName: null,

    //___________________________________________________________

    isTurnComplete: false,
    endOfTurnMessage: "",
    handValue: null,
    showIsBust: false,
  }),
  mounted: function () {
    if (this.cardTableConfig) {
      this.loadConfig(this.cardTableConfig);

      //Set up deck
      this.setupDeck();

      //Set up player Hand
      this.setupPlayerHand();

      //Set up dealer hand
      this.setupDealerHand();
    } else {
      //No config loaded - show debug tools for now
      this.hasDebugTools = true;

      this.quickLog(`CARDTABLE.VUE - Can't find config`);
    }
  },
  computed: {
    ...mapGetters([
      "projectName",
      "currentSession",
      "getRemoteDataGroup",
      "currentUserId",
      "currentRoomName",
    ]),

    allCardsInDeck() {
      return this.cardDeck.CardArray;
    },
  },
  watch: {},
  methods: {
    popDeck: function () {
      this.cardDeck = null;

      //Let vue react to nulling the deck, THEN repopulate it with a fresh deck
      this.$nextTick(() => {
        let deck = new DeckOfCards();
        deck.populateTraditionalDeck();
        this.cardDeck = deck;
        this.playerHand = [];
      });
    },

    shuffleDeck: function () {
      this.cardDeck.shuffleDeck();
    },

    dealACardToPlayer: function () {
      let c = this.cardDeck.dealACard();

      if (c) this.playerHand.push(c);
    },

    flipDeckCard: function (id) {
      this.allCardsInDeck
        .filter((x) => x.Id == id)
        .forEach((element) => {
          element.flipCard();
        });
    },

    flipHandCard: function (id) {
      this.playerHand
        .filter((x) => x.Id == id)
        .forEach((element) => {
          element.flipCard();
        });
    },

    loadConfig(config) {
      this.gameName = config.gameName;

      this.showDebugTools = config.showDebugTools;

      //THESE WILL ALL BE IN THE RemoteDataGroup OBJECT IN THE VUEX STORE
      //Describe the location and name of the deck and the player hand object in the remote document...
      this.deckLocation = config.deckLocation;
      this.deckName = config.deckName;
      this.playerInfoLocation = config.playerInfoLocation;
      this.playerInfoName = config.playerInfoName;
      this.dealerInfoLocation = config.dealerInfoLocation;
      this.dealerInfoName = config.dealerInfoName;

      //Deck
      this.showContentsOfDeck = config.showContentsOfDeck;

      //Deck Controls

      //Hands
      this.showCurrentPlayerHand = config.showCurrentPlayerHand;
      this.showAllPlayerHands = config.showAllPlayerHands;

      this.showDealerHand = config.showDealerHand;

      //Hand Controls
      //(these controls have a default behavior - providing a function name will call the function instead of using default behavior overriding the control)
      this.showHitControl = config.showHitControl;
      this.hitControlFunctionName = config.hitControlFunctionName;

      this.showStandControl = config.showStandControl;
      this.standControlFunctionName = config.standControlFunctionName;

      this.endTurnFunctionName = config.endTurnFunctionName;

      // Messages
      this.showMessage = config.showMessage;
      this.simpleMessage = config.simpleMessage;
      this.messageFunctionName = config.messageFunctionName;
    },

    //Setup Functions ----------------------------------------------------------

    setupDeck: function () {
      let dl = this.deckLocation;
      let dn = this.deckName;
      if (dl && dn) {
        let loc = this.getRemoteDataGroup[dl];
        let deckMap = loc[dn];

        let gameDeck = new DeckOfCards();
        gameDeck.fromMap(deckMap);
        this.cardDeck = gameDeck;
      } else this.quickLog(`CARDTABLE.VUE - Can't find initial Deck!`);
    },

    setupPlayerHand: function () {
      let pl = this.playerInfoLocation;
      let pn = this.playerInfoName;
      if (pl && pn) {
        let loc = this.getRemoteDataGroup[pl];
        let playerInfoArrayMap = loc[pn];

        let playerInfo = playerInfoArrayMap.find(
          (x) => x.id == this.currentUserId
        );
        this.playerHand = sgf.mainFramework.gameTools.getCardArrayFromMapArray(
          playerInfo.cards
        );
      } else this.quickLog(`CARDTABLE.VUE - can't find initial player info!`);
    },

    setupDealerHand: function () {
      let dIL = this.dealerInfoLocation;
      let dIN = this.dealerInfoName;
      if (dIL && dIN) {
        let loc = this.getRemoteDataGroup[dIL];
        let dealerInfo = loc[dIN];

        this.dealerHand = sgf.mainFramework.gameTools.getCardArrayFromMapArray(
          dealerInfo.cards
        );
      } else this.quickLog(`CARDTABLE.VUE - can't find initial player info!`);
    },

    //Control Functions ----------------------------------------------------------

    hit: function () {
      let deck = this.cardDeck;
      let hand = this.playerHand;

      let resultObj = this.gameClass[this.hitControlFunctionName](deck, hand);

      this.cardDeck = resultObj.deck;
      this.playerHand = resultObj.hand;

      // {
      //     deck: deck,
      //     hand: hand,
      //     handValue: handVal,
      //     readyForEnd:isItTimeToEnd,
      // }

      if (resultObj.readyForEnd)
        this.endPlayerTurn(resultObj.handValue, resultObj.isBust);
    },

    stand: function () {
      let deck = this.cardDeck;
      let hand = this.playerHand;

      let resultObj = this.gameClass[this.standControlFunctionName](deck, hand);

      if (resultObj.readyForEnd)
        this.endPlayerTurn(resultObj.handValue, resultObj.isBust);
    },

    endPlayerTurn: function (finalHandValue, isBust) {
      //End state for this component
      this.isTurnComplete = true;
      this.endOfTurnMessage =
        "Your turn is over, your hand total is: " + finalHandValue;
      this.handValue = finalHandValue;
      this.showIsBust = isBust;

      //Emit the end result so the game can continue
      let endTurnResult = {
        endTurnFunctionName: this.endTurnFunctionName,
        deck: this.cardDeck,
        hand: this.playerHand,
        finalHandValue: finalHandValue,
        isBust: isBust,
      };

      this.$emit("endOfTurnEvent", endTurnResult);
    },

    getStringFromFunction: function (funcName) {
      let resultString = this.gameClass[funcName](
        this.getRemoteDataGroup,
        this.currentUserId
      );

      return resultString;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.top-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.scroll-cards {
  overflow-x: auto;
  display: flex;
}
</style>
