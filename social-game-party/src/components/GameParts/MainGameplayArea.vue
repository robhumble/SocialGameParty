<template>
  <div class="gameplay-area">
    Hay hay hay this is the gameplay area!
    <div v-if="isGameStarted && isHost" class="host-reset">
      <v-btn @click="resetGame">Reset Game</v-btn>
    </div>

    <div class="game-components">
      <QuestionAndAnswer
        v-if="currentGameComponent == 'QuestionAndAnswer'"
        :questionText="questionAndAnswerQuestionText"
        @answerEvent="questionAndAnswerHandler"
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

import * as sgf from "@/logic/socialGameFramework.js";

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
    //If the game hasn't been started yet (i.e. no host), show the start screen.
   if (!this.isGameStarted) 
    this.currentGameComponent = "StartGameScreen";
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

    isHost: function () {
      return this.hostId == this.currentSession.currentUser.uniqueId;
    },
  },
  watch: {
    //If the hostId gets updated, setup the game runner, or update it to reflect the new host.
    hostId: function (n, o) {
      if (n != o) {
        if (n) {
          if (!this.gameRunner) this.setupGame();
          else this.gameRunner.hostId = n;
        } else {
          // if the host is set to null reset the game...
          this.resetGame();
        }
      }
    },

    playerGameData: function (n, o) {

      //TODO: may want to do a host check here - since only the host is running steps at the moment
      //Watch the current step - if it changes, run the new step 
      if (n.currentStep && n.currentStep != o.currentStep) {
        if(this.gameRunner)
          this.gameRunner.runStep(n.currentStep, this.getRemoteDataGroup);
        else 
          console.log(`Cannot run step ${n.currentStep}, gameRunner is null.`);
      }

      //Watch from a check instruction -- Check instructions watch target should only be in playerGameData.
      //If there are check instructions and the watch target is updated, run the check function.
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

      //Only update if the instructions are different (based on a shallow compare)
      if (n && !sgf.mainFramework.isObjectSimilar(n,o)) {
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
  },
  methods: { 

    
    /**
     * Start the game by setting the host id.
     */
    startGame: function () {
      let hostId = this.currentSession.currentUser.uniqueId;
      let roomName = this.currentRoomName;

      this.dataConnector.updateHost(hostId, roomName);
    },

    /**
     * Setup the current game by initializing the gameRunner and game.
     */
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

    /**
     * Clear local component display properties.
     */
    clearDisplay: function () {
      this.currentGameComponent = null;
      this.displayInstructions = null;
      this.loopThroughData = null;
      this.questionAndAnswerQuestionText = "";
    },

    /**
     * Setup basic display components (i.e. loading screen, results).
     */
    setUpDisplay: function (instructions) {
      this.currentGameComponent = instructions.comp;
      this.displayInstructions = instructions;
    },

    //TODO: probably need to alter this to allow for more than just question/answer pattern OR specify that this is just for that pattern
    /**
     * Setup complex "LoopThrough" instructions that specify a series of things to display and follow up actions.
     */
    setUpLoopThrough: function (instructions) {
      let loopSrc = this.playerGameData[instructions.loopSrc];

      let loopData = {
        loopSrc: loopSrc,                             //data source that we will loop through (i.e. an array of objects) - this has to be found in playerGameData
        index: 0,                                     //current position in the loopSrc

        srcQuestionVar: instructions.questionVar,     //The name of the variable in the loopSrc that contains a question
        srcAnswerVar: instructions.answerVar,         //The name of the variable in the loopSrc that contains a answer

        component: instructions.comp,                 //The name of the game part component to feed this into
        correctAnswerCount: 0,                        //The number of correctly answered questions
        resultFunction: instructions.resultFunction,  //The function to pass the correctAnswerCount to.
      };

      this.loopThroughData = loopData;

      this.goThroughLoop();
    },

    /**
     * Iterate through the loop / goto next step in loop.
     */
    goThroughLoop: function () {
      let i = this.loopThroughData.index;
      let cur = this.loopThroughData.loopSrc[i];

      //QuestionAndAnswer section
      if (this.loopThroughData.component == "QuestionAndAnswer") {
        this.currentGameComponent = this.loopThroughData.component;
        this.questionAndAnswerQuestionText =
          cur[this.loopThroughData.srcQuestionVar];     
      }

    },

    /**
     * Callback/handler after the user answers a question.
     */
    questionAndAnswerHandler: function (answer) {

      //Use this logic if we are actively in a loop (we assume the answer is for a looped question then)
      if (this.loopThroughData) {
        let i = this.loopThroughData.index;
        let currentLoopData = this.loopThroughData.loopSrc[i];
        let correctAnswer = currentLoopData[this.loopThroughData.srcAnswerVar];

        if (answer == correctAnswer) this.loopThroughData.correctAnswerCount++;

        //If last, call the result function
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

    /**
     * Reset all the properties related to the current game.  i.e. null out the game runner, clear db, reset display props for this component.
     */
    resetGame: function () {     
      
      if (this.gameRunner) {
        this.gameRunner.resetGame();
      } else {
        //If the game is reset somehow without a gameRunner, at least make sure the db is cleaned out.
        this.dataConnector.resetGameData(this.currentRoomName);
      }
      this.gameRunner = null;

      this.clearDisplay();
      this.currentGameComponent = "StartGameScreen";

      console.log("Game reset by host...");
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
