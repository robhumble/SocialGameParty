<template>
  <div class="gameplay-area">
    Hay hay hay this is the gameplay area!
    <div class="game-components">
      <QuestionAndAnswer
        v-if="currentGameComponent == 'QuestionAndAnswer'"
        :questionText="questionAndAnswerQuestionText"
        @answerEvent="questionAndAnswerLoopHandler"
      ></QuestionAndAnswer>

      <ResultScreen
        v-if="currentGameComponent == 'ResultScreen'"
        :resultTitle="displayInstructions.title"
        :resultText="displayInstructions.msg"
      ></ResultScreen>

      <StartGameScreen v-if="currentGameComponent == 'StartGameScreen'" @startGame="startGame"></StartGameScreen>

      <LoadingScreen
        v-if="currentGameComponent == 'LoadingScreen'"
        :loadingMessageText="displayInstructions.msg"
      ></LoadingScreen>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";

import QuestionAndAnswer from "@/components/GameParts/QuestionAndAnswer.vue";
import ResultScreen from "@/components/GameParts/ResultScreen.vue";
import StartGameScreen from "@/components/GameParts/StartGameScreen.vue";
import LoadingScreen from "@/components/GameParts/LoadingScreen.vue";

//TODO: integrate these with this component
import GameRunner from "@/logic/GameRunner.js";
import MathMasterGame from "@/logic/MathMasterGame.js";

export default {
  name: "MainGameplayArea",
  components: {
    QuestionAndAnswer,
    ResultScreen,
    StartGameScreen,
    LoadingScreen,
  },
  props: ["", ""],
  data: () => ({
    dataConnector: new GameplayDataConnector(),
    currentGameComponent: "",
    gameRunner: null,

    //Basic display instructions
    displayInstructions: null,

    //Loop instructions
    loopThroughData: null,
    questionAndAnswerQuestionText: "",
    //checkInstructions: null
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
      "currentInstructions",
      "currentCheckInstructions",

      "myTempGameData",
      "getRemoteDataGroup",
    ]),
  },
  watch: {
    //If the hostId gets updated, setup the game runner, or update it to reflect the new host.
    hostId: function (n, o) {
      if (n != o) {
        if (!this.gameRunner) this.setupGame();
        else this.gameRunner.hostId = n;
      }
    },

    playerGameData: function (n, o) {
      //Step
      if (n.currentStep && n.currentStep != o.currentStep) {
        this.gameRunner.runStep(n.currentStep, this.getRemoteDataGroup);
      }

      //Watch from a check instruction
      if (this.currentCheckInstructions) {
        let watchTarget = this.currentCheckInstructions.watchTarget;

        if (n[watchTarget] != o[watchTarget]) {
          this.gameRunner.callGameFunction(
            this.currentCheckInstructions.checkFunction,
            this.getRemoteDataGroup
          );
        }
      }
    },

    currentInstructions: function (n, o) {
      //Instructions

      console.log(n + o);

      if (n) {
        if (n.type == "Display") {
          this.clearDisplay();
          this.setUpDisplay(n);
        }

        if (n.type == "LoopThrough") {
          this.clearDisplay();
          this.setUpLoopThrough(n);
        }
      }
    },

    // currentCheckInstructions: function (n, o) {
    //   //Check Instructions
    //  /* if (n) {
    //     let watchTarget = n.watchTarget;

    //     if (n[watchTarget] != o[watchTarget]) {
    //       this.gameRunner.callGameFunction(
    //         n.checkFunction,
    //         this.getRemoteDataGroup
    //       );
    //     }
    //   }*/
    //    if (n != o) {
    //      this.checkInstructions = n;
    //   }
    // },
  },
  methods: {
    getCurrentGameComponent: function () {
      if (!this.isGameStarted) this.currentGameComponent = "StartGameScreen";
    },

    //Set the host id.
    startGame: function () {
      let hostId = this.currentSession.currentUser.uniqueId;
      let roomName = this.currentRoomName;

      this.dataConnector.updateHost(hostId, roomName);
    },

    setupGame: function () {
      this.gameRunner = new GameRunner();
      let game = new MathMasterGame(this.currentRoomName);
      this.gameRunner.setupCurrentGame(
        game,
        this.currentRoomName,
        this.hostId,
        this.currentSession.currentUser.uniqueId
      );
    },

    clearDisplay: function () {
      this.currentGameComponent = null;
      this.displayInstructions = null;
      this.loopThroughData = null;
      this.questionAndAnswerQuestionText = "";
    },

    //Setup basic display components
    setUpDisplay: function (instructions) {
      this.currentGameComponent = instructions.comp;
      this.displayInstructions = instructions;
    },

    //Setup a loop
    setUpLoopThrough: function (instructions) {
      let loopSrc = this.playerGameData[instructions.loopSrc];

      let loopData = {
        loopSrc: loopSrc,
        index: 0,

        srcQuestionVar: instructions.questionVar,
        srcAnswerVar: instructions.answerVar,

        component: instructions.comp,
        correctAnswerCount: 0,
        resultFunction: instructions.resultFunction,
      };

      this.loopThroughData = loopData;

      this.goThroughLoop();
    },

    //Iterate through the loop / goto next step in loop
    goThroughLoop: function () {
      let i = this.loopThroughData.index;
      let cur = this.loopThroughData.loopSrc[i];

      if (this.loopThroughData.component == "QuestionAndAnswer") {
        this.currentGameComponent = this.loopThroughData.component;
        this.questionAndAnswerQuestionText =
          cur[this.loopThroughData.srcQuestionVar];

        //this.questionAndAnswerHandler = questionAndAnswerHandlerFunc
      }
    },

    //Callback/handler after the user answers a question in a loop
    questionAndAnswerLoopHandler: function (answer) {
      if (this.loopThroughData) {
        let i = this.loopThroughData.index;
        let currentLoopData = this.loopThroughData.loopSrc[i];
        let correctAnswer = currentLoopData[this.loopThroughData.srcAnswerVar];

        if (answer == correctAnswer) this.loopThroughData.correctAnswerCount++;

        //If last call the result function
        if (i == this.loopThroughData.loopSrc.length - 1) {
          this.gameRunner.callGameFunction(
            this.loopThroughData.resultFunction,
            this.getRemoteDataGroup,
            this.loopThroughData.correctAnswerCount
          );
          this.clearDisplay();
        } else {
          this.loopThroughData.index++;
          this.goThroughLoop();
        }
      }
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
