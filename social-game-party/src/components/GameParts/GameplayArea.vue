<template>
  <div class="gameplay-area">
    Hay hay hay this is the gameplay area!
    <div class="game-components">
      <QuestionAndAnswer v-if="currentGameComponent == 'QuestionAndAnswer'"></QuestionAndAnswer>
      <ResultScreen v-if="currentGameComponent == 'ResultScreen'"></ResultScreen>
      <StartGameScreen v-if="currentGameComponent == 'StartGameScreen'" @startGame="startGame"></StartGameScreen>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";

import QuestionAndAnswer from "@/components/GameParts/QuestionAndAnswer.vue";
import ResultScreen from "@/components/GameParts/ResultScreen.vue";
import StartGameScreen from "@/components/GameParts/StartGameScreen.vue";

//TODO: integrate these with this component
// import GameRunner from "@/logic/GameRunner.js"
// import MathMasterGameTools from "@/logic/MathMasterGameTools.js"

export default {
  name: "GameplayArea",
  components: {
    QuestionAndAnswer,
    ResultScreen,
    StartGameScreen,
  },
  props: ["", ""],
  data: () => ({
    dataConnector: new GameplayDataConnector(),
    currentGameComponent: "",
  }),
  mounted: function () {
    this.getCurrentGameComponent();
  },
  computed: {
    ...mapGetters([
      "projectName",
      "userList",
      "currentSession",
      "currentRoomName",
      "isGameStarted",
      "hostId",
      "spectatorGameData",
      "playerGameData",
      "myTempGameData",
    ]),
  },
  watch: {},
  methods: {
    getCurrentGameComponent: function () {
      if (!this.isGameStarted) this.currentGameComponent = "StartGameScreen";
    },

    startGame: function () {
      let hostId = this.currentSession.currentUser.uniqueId;
      let roomName = this.currentRoomName;

      this.dataConnector.updateHost(hostId, roomName);

      this.$store.commit("setSpectatorGameData", {});
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.gameplay-area {
  color: black;
  border-style: dotted;
  border-color: $social-game-party-orange !important;
  padding: 5px;
  margin: 5px;
  min-height: 50vh;
}
</style>
