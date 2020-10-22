<template>
  <div style="text-align: center">
    <h1>CARD TABLE</h1>

    <v-btn @click="popDeck">Go</v-btn>

    <v-btn @click="shuffleDeck">...shuffle?</v-btn>

    <table v-if="cardDeck">  
      <tr>
        <td>suit</td>
        <td>color</td>
        <td>value</td>
      </tr>

      <tr v-for="c in cardDeck.CardArray" :key="c.Suit + c.Value">
        <VisualCard :cardObject="c"></VisualCard>
        <td>{{ c.Suit }}</td>
        <td>{{ c.Color }}</td>
        <td>{{ c.Value }}</td>
      </tr>
    </table>
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
    // loadingMessageText: "",

    cardDeck: null,
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),
  },
  watch: {},
  methods: {
    popDeck: function () {
      let deck = new DeckOfCards();

      deck.populateTraditionalDeck();

      this.cardDeck = deck;
    },

    shuffleDeck: function(){
      this.cardDeck.shuffleDeck();
    }
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";
</style>
