<template>
  <div>
    <div class="test-div">
      <button @click="toggleDrop">Drop</button>

      <img src="@/assets/SocialGameParty.png" />
    </div>

    <div v-show="isDroppedIn" class="drop-bg-div"></div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import MathMasterGameTools from "@/logic/Games/MathMasterGame.js";
// import QuestionAndAnswer from "@/components/GameParts/QuestionAndAnswer.vue"
// import ResultScreen from "@/components/GameParts/ResultScreen.vue"

// import CardTable from "@/components/CardParts/CardTable.vue";

// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "Experimental",
  components: {
    // QuestionAndAnswer,
    // ResultScreen
    // CardTable,
  },
  data: () => ({
    isDroppedIn: false,
  }),
  mounted: function () {
    if (this.isDebug) this.$store.commit("setIsDebugMode", true);

    this.quickLog("Made it to Experimental!");
  },
  computed: {
    ...mapGetters([
      "projectName",
      "userList",
      "currentSession",
      "currentRoomName",
      "currentUserId",
      "isGameStarted",
      "hostId",
      "selectedGameName",
      "spectatorGameData",
      "playerGameData",
      "currentStep",
      "currentInstructions",
      "currentCheckInstructions",
      "currentTargetedInstructions",
      "currentHudInstructions",
      "currentAltViewInstructions",

      "results",
      "dynamicHostGameData",
      "myTempGameData",
      "getRemoteDataGroup",
    ]),
  },
  watch: {},
  methods: {
    toggleDrop: function () {
      this.isDroppedIn = !this.isDroppedIn;
    },
  },
};
</script>
<style lang="scss" scoped>
.experimental {
  text-align: center;
}

.test-div {
  display: inline-grid;
  z-index: 1;
  position: relative;
}

.drop-bg-div {
  width: 100%;
  height: 100px;
  background: red;
  position: relative;
  animation: myfirst 5s 1;
  //animation-direction: alternate;
  top: -50px;
}

@keyframes myfirst {
  0% {
    background: red;
    top: 800px;
  }
  // 25%  {background: yellow; left: 200px; top: 0px;}
  // 50%  {background: blue; left: 200px; top: 200px;}
  // 75%  {background: green; left: 0px; top: 200px;}
  100% {
    background: red;
    top: -50px;
  }
}
</style>
