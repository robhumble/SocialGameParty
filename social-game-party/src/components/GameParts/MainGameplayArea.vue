<template>
  <div>
    <v-btn @click="exitGame()">Leave Game</v-btn>

    <div class="gameplay-area">
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

        <StartGameScreen
          v-if="currentGameComponent == 'StartGameScreen'"
          @startGame="startGame"
        ></StartGameScreen>

        <LoadingScreen
          v-if="currentGameComponent == 'LoadingScreen'"
          :loadingMessageText="displayInstructions.msg"
        ></LoadingScreen>
      </div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";

import ActivePlayerGameDataConnector from "@/dataConnectors/ActivePlayerGameDataConnector.js";
import HostGameDataConnector from "@/dataConnectors/HostGameDataConnector.js";

import QuestionAndAnswer from "@/components/GameParts/QuestionAndAnswer.vue";
import ResultScreen from "@/components/GameParts/ResultScreen.vue";
import StartGameScreen from "@/components/GameParts/StartGameScreen.vue";
import LoadingScreen from "@/components/GameParts/LoadingScreen.vue";

import * as sgf from "@/logic/socialGameFramework.js";

//TODO: integrate these with this component
import GameRunner from "@/logic/GameRunner.js";
import MathMasterGame from "@/logic/Games/MathMasterGame.js";

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
    // gamePlayDataConnector: new GameplayDataConnector(),
    currentGameComponent: "",
    gameRunner: new GameRunner(),

    //Basic display instructions
    displayInstructions: null,

    //Loop instructions
    loopThroughData: null,
    questionAndAnswerQuestionText: "",
    //checkInstructions: null

    activePlayerGameDataConnector: new ActivePlayerGameDataConnector(),
    hostGameDataConnector: new HostGameDataConnector(),
  }),
  mounted: function () {
    //If the game hasn't been started yet (i.e. no host), show the start screen.
    if (!this.isGameStarted) this.currentGameComponent = "StartGameScreen";
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
      "currentStep",
      "currentInstructions",
      "currentCheckInstructions",

      "results",
      "dynamicHostGameData",
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
          if (this.gameRunner.isGameInProgress()) this.gameRunner.hostId = n;
          else this.setupGame();
        } else {
          // if the host is set to null reset the game...
          this.resetGame();
        }
      }
    },

    //AGPD-------------------------------------

    currentStep: function (n, o) {
      //TODO: may want to do a host check here - since only the host is running steps at the moment
      //Watch the current step - if it changes, run the new step
      if (n && n != o) {
        if (this.gameRunner)
          this.gameRunner.runStep(n, this.getRemoteDataGroup);
        else this.quickLog(`Cannot run step ${n}, gameRunner is null.`);
      }
    },

    playerGameData: function (n, o) {
      //Watch from a check instruction -- Check instructions watch target should only be in playerGameData if the rootObj is "player".
      //If there are check instructions and the watch target is updated, run the check function.
      if (
        this.currentCheckInstructions &&
        this.currentCheckInstructions.rootObj == "player"
      ) {
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

      this.quickLog(n + o);

      //Only update if the instructions are different (based on a shallow compare)
      if (n && !sgf.mainFramework.isObjectSimilar(n, o)) {
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

    //Host---------------------------------------------------------------------
    results: function (n) {
      //Watch from a check instruction -- Check instructions
      //If there are check instructions run the check function.
      if (
        this.currentCheckInstructions &&
        this.currentCheckInstructions.rootObj == "results"
      ) {
        if (n) {
          this.gameRunner.callGameFunction(
            this.currentCheckInstructions.checkFunction,
            this.getRemoteDataGroup
          );
        }
      }
    },

    dynamicHostGameData: function (n, o) {
      //Watch from a check instruction -- Check instructions watch target should only be in dynamicHostGameData if the rootObj is "host".
      //If there are check instructions and the watch target is updated, run the check function.
      if (
        this.currentCheckInstructions &&
        this.currentCheckInstructions.rootObj == "host"
      ) {
        let watchTarget = this.currentCheckInstructions.watchTarget;

        if (n[watchTarget] != o[watchTarget]) {
          this.gameRunner.callGameFunction(
            this.currentCheckInstructions.checkFunction,
            this.getRemoteDataGroup
          );
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

      this.gameRunner.setHost(hostId, roomName);
    },

    /**
     * Setup the current game by initializing the gameRunner and game.
     */
    setupGame: function () {
      let game = new MathMasterGame(this.currentRoomName);
      this.gameRunner.setupCurrentGame(
        game,
        this.currentRoomName,
        this.hostId,
        this.currentSession.currentUser.uniqueId
      );

      this.listenToActivePlayerGameData();

      if (this.isHost) this.listenToHostGameData();
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

    //TODO: require an instructions object here, instead of just hoping we get one.
    /**
     * Setup basic display components (i.e. loading screen, results).
     */
    setUpDisplay: function (instructions) {
      //Expects an instructions object like this:
      /*
        let instructions = {
            type: "Display",          //type of instruction
            comp: "LoadingScreen",    //name of component to use
            msg: "Preparing Game..."  //message to use in the component
        }
      */

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
        loopSrc: loopSrc, //data source that we will loop through (i.e. an array of objects) - this has to be found in playerGameData
        index: 0, //current position in the loopSrc

        srcQuestionVar: instructions.questionVar, //The name of the variable in the loopSrc that contains a question
        srcAnswerVar: instructions.answerVar, //The name of the variable in the loopSrc that contains a answer

        component: instructions.comp, //The name of the game part component to feed this into
        correctAnswerCount: 0, //The number of correctly answered questions
        resultFunction: instructions.resultFunction, //The function to pass the correctAnswerCount to.
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
        let correctAnswer = String(
          currentLoopData[this.loopThroughData.srcAnswerVar]
        );
        // correctAnswer was a number, answer is a string. Casting correctAnswer permits ===, which fixes null equaling zero.
        if (answer === correctAnswer) this.loopThroughData.correctAnswerCount++;

        //If last, call the result function
        if (i == this.loopThroughData.loopSrc.length - 1) {
          this.gameRunner.callGameFunction(
            this.loopThroughData.resultFunction,
            this.getRemoteDataGroup,
            this.loopThroughData.correctAnswerCount
          );
          this.clearDisplay();

          //Set "waiting" message
          this.setUpDisplay({
            type: "Display", //type of instruction
            comp: "LoadingScreen", //name of component to use
            msg: "Waiting for all players to finish...", //message to use in the component
          });
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
      this.activePlayerGameDataConnector.unsubscribeToActivePlayerGameData();
      this.hostGameDataConnector.unsubscribeToHostGameData();

      if (this.gameRunner) {
        this.gameRunner.resetGame();
      } else {
        //If the game is reset somehow without a gameRunner, at least make sure the db is cleaned out.
        //this.gamePlayDataConnector.resetGameData(this.currentRoomName);
      }
      //this.gameRunner = null;

      this.clearDisplay();
      this.currentGameComponent = "StartGameScreen";

      this.quickLog("Game reset by host...");
    },

    listenToActivePlayerGameData: function () {
      var that = this;

      this.activePlayerGameDataConnector.listenToActivePlayerGameData(function (
        remoteDocData
      ) {
        //that.$store.commit("setUserList", remoteRoomData.users);

        //Game data contained in room
        // that.$store.commit("setHostId", remoteRoomData.hostId);
        // that.$store.commit(
        //   "setSpectatorGameData",
        //   remoteRoomData.spectatorGameData
        // );

        //TODO: MOVE THESE SO IT REFERENCES THE ACTIVEPLAYERGAMEDATA COLLECTION INSTEAD OF THE ROOM

        that.$store.commit("setCurrentStep", remoteDocData.currentStep);

        that.$store.commit(
          "setPlayerGameData",
          remoteDocData.dynamicPlayerGameData
        );

        that.$store.commit(
          "setCurrentInstructions",
          remoteDocData.currentInstructions
        );
        that.$store.commit(
          "setCurrentCheckInstructions",
          remoteDocData.currentCheckInstructions
        );
      },
      that.currentRoomName);
    },

    listenToHostGameData: function () {
      var that = this;

      this.hostGameDataConnector.listenToHostGameData(function (remoteDocData) {
        that.$store.commit("setResults", remoteDocData.results);
        that.$store.commit(
          "setDynamicHostGameData",
          remoteDocData.dynamicHostGameData
        );
      }, that.currentRoomName);
    },

    exitGame: function () {
      this.activePlayerGameDataConnector.unsubscribeToActivePlayerGameData();
      this.hostGameDataConnector.unsubscribeToHostGameData();

      this.$emit("exitGame");
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
