<template>
  <div>
    <div
      v-if="!showCard"
      @click="flipVisualCard"
      class="game-card card-back"
    ></div>
    <div v-if="showCard" @click="flipVisualCard" class="game-card card-front">
      <div
        class="top-left-val"
        :style="{ color: cardObject.Color == 'red' ? 'red' : 'black' }"
      >
        <b>{{ cardObject.Value }}</b>
      </div>
      <div>
        <img
          :src="getSuitImageName(cardObject.Suit)"
          :class="cardObject.Color == 'red' ? 'red-img' : 'black-img'"
        />
      </div>
      <div
        class="bottom-right-val"
        :style="{ color: cardObject.Color == 'red' ? 'red' : 'black' }"
      >
        <b>{{ cardObject.Value }}</b>
      </div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

//import Card from "@/logic/Cards/Card.js";

export default {
  name: "VisualCard",
  components: {},
  props: ["cardObject"],
  // [
  //   "CardType"
  //   ,"Suit"
  //   ,"Color"
  //   ,"Value"
  //   ,"Title"
  //   ,"Message"],

  data: () => ({
    // loadingMessageText: "",
    //cardObject: null
    //showCard: true,
  }),
  mounted: function () {
    // if(this.startFaceDown)
    //   this.showCard = false;
  },
  computed: {
    ...mapGetters(["projectName", "currentSession"]),

    showCard: function () {
      return this.cardObject.isFaceUp;
    },
  },
  watch: {},
  methods: {
    getSuitImageName(suitStr) {
      switch (suitStr) {
        case "heart":
          return require("@/assets/hollowHeart.png");
        case "diamond":
          return require("@/assets/hollowDiamond.png");
        case "spade":
          return require("@/assets/hollowSpade.png");
        case "club":
          return require("@/assets/hollowClub.png");
      }
    },

    flipVisualCard() {
      //this.showCard = !this.showCard;

      this.$emit("flipTargetCard", this.cardObject.Id);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.game-card {
  height: 200px;
  width: 140px;
  border-radius: 8%;
  border-style: solid;
  box-shadow: 4px 6px #404040;
  border-width: 1px;

  // Min height and width for the card to be somewhat recognizable
  // min-width: 80px;
  // min-height: 138px;

  margin: 15px;
  position: relative;
}

.red-img {
  margin-top: 20px;
  height: 75px;
  width: 75px;
  background-color: red;
}

.black-img {
  margin-top: 20px;
  height: 75px;
  width: 75px;
  background-color: black;
}

.top-left-val {
  text-align: left;
  margin: 10px;
}

.bottom-right-val {
  position: absolute;
  bottom: 0px;
  right: 0px;
  margin: 10px;
}

.card-back {
  background-image: url("~@/assets/CardBack.png");
}
</style>
