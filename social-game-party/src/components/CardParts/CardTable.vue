<template>
  <div style="text-align: center">
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
        <VisualCard :cardObject="c"></VisualCard>
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
      ></VisualCard>
    </div>

    <!-- HAND -->
    <div v-if="playerHand.length > 0" class="scroll-cards">
      <v-label>Player Hand (scroll)</v-label>
      <VisualCard
        v-for="c in playerHand"
        :key="c.Suit + c.Value"
        :cardObject="c"
      ></VisualCard>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

import VisualCard from "@/components/CardParts/VisualCard.vue";

import DeckOfCards from "@/logic/Cards/DeckOfCards.js";
//import Card from "@/logic/Cards/Card.js";

export default {
  name: "CardTable",
  components: {
    VisualCard,
  },
  props: [],
  data: () => ({
    cardDeck: null, //The Deck

    playerHand: [], //The players cards

    deckViewType: "",
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),

    allCardsInDeck() {
      return this.cardDeck.CardArray;
    },
  },
  watch: {},
  methods: {
    popDeck: function () {
      let deck = new DeckOfCards();

      deck.populateTraditionalDeck();

      this.cardDeck = deck;

      this.playerHand = [];
    },

    shuffleDeck: function () {
      this.cardDeck.shuffleDeck();
    },

    dealACardToPlayer: function () {
      let c = this.cardDeck.dealACard();

      if (c) this.playerHand.push(c);
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
