<template>
  <div>
    <div v-if="!showCard" @click="flipCard" class="game-card card-back"></div>
    <div v-if="showCard" @click="flipCard" class="game-card card-front">
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
  props: ["cardObject","startFaceDown"],
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
    showCard: true,
  }),
  mounted: function () {

    if(this.startFaceDown)
      this.showCard = false;

  },
  computed: {
    ...mapGetters(["projectName", "currentSession"]),


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

    flipCard(){
      this.showCard = !this.showCard;
    }

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

.card-back{
  background-image: url("~@/assets/CardBack.png") ;  
}
</style>
