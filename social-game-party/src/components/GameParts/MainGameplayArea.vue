<template>
  <div>
    <v-btn @click="exitGame()">Leave Game</v-btn>

    <div class="gameplay-area">
      <v-tabs
        v-model="tab"
        centered
        background-color="$social-game-party-orange"
        class="gameplay-tabs"
      >
        <v-tabs-slider></v-tabs-slider>

        <v-tab :class="!altViewInstructions ? 'hide-me' : ''">
          GAME
          <!-- <v-icon>mdi-phone</v-icon> -->
        </v-tab>

        <v-tab v-if="altViewInstructions">
          ALT
          <!-- <v-icon>mdi-phone</v-icon> -->
        </v-tab>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <!-- Reset Game Button -->
            <div v-if="isGameStarted && isHost" class="host-reset">
              <v-btn @click="resetGame">Reset Game</v-btn>
            </div>

            <!-- Top Row HUD -->
            <div class="top-hud-row">
              <RowHUD
                v-if="hudInstructions"
                :hudInfoData="hudInstructions.hudInfoData"
                :gameClass="hudInstructions.hudInfoFuncName ? gameClass : null"
                :hudInfoFunc="hudInstructions.hudInfoFuncName"
              ></RowHUD>
            </div>

            <!-- Main Centered Game Parts -->
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
                @startGame="startGame($event)"
              ></StartGameScreen>

              <LoadingScreen
                v-if="currentGameComponent == 'LoadingScreen'"
                :loadingMessageText="displayInstructions.msg"
              ></LoadingScreen>

              <CardTable
                v-if="currentGameComponent == 'CardTable'"
                :cardTableConfig="displayInstructions.config"
                :gameClass="gameClass"
                @endOfTurnEvent="cardTableEndTurnHandler"
              ></CardTable>

              <YesNoQuestion
                v-if="currentGameComponent == 'YesNoQuestion'"
                :questionText="displayInstructions.questionText"
                @answerEvent="questionAndAnswerHandler"
              ></YesNoQuestion>
            </div>
          </v-tab-item>

          <v-tab-item v-if="altViewInstructions">
            <!-- Top Row HUD -->
            <div class="top-hud-row">
              <ScoreBoard
                v-if="
                  altViewInstructions &&
                  altViewInstructions.comp == 'ScoreBoard'
                "
                :altViewInfoData="altViewInstructions.altViewInfoData"
                :gameClass="
                  altViewInstructions.altViewInfoFuncName ? gameClass : null
                "
                :altViewInfoFuncName="altViewInstructions.altViewInfoFuncName"
              ></ScoreBoard>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
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
import CardTable from "@/components/CardParts/CardTable.vue";
import YesNoQuestion from "@/components/GameParts/YesNoQuestion.vue";
import RowHUD from "@/components/GameParts/RowHUD.vue";
import ScoreBoard from "@/components/GameParts/ScoreBoard.vue";

import * as sgf from "@/logic/socialGameFramework.js";

//TODO: integrate these with this component
import GameRunner from "@/logic/GameRunner.js";
import MathMasterGame from "@/logic/Games/MathMasterGame.js";
import BlackJackGame from "@/logic/Games/BlackJackGame.js";

export default {
  name: "MainGameplayArea",
  components: {
    QuestionAndAnswer,
    ResultScreen,
    StartGameScreen,
    LoadingScreen,
    CardTable,
    YesNoQuestion,
    RowHUD,
    ScoreBoard,
  },
  props: ["", ""],
  data: () => ({
    tab: null,

    // gamePlayDataConnector: new GameplayDataConnector(),
    currentGameComponent: "",
    gameRunner: new GameRunner(),

    selectedGame: "",

    //MAIN VIEW - Basic display instructions - can come from currentInstructions OR currentTargetedInstructions
    displayInstructions: null,

    //Loop instructions - can come from currentInstructions OR currentTargetedInstructions
    loopThroughData: null,
    questionAndAnswerQuestionText: "",

    //HUD Instructions
    hudInstructions: null,

    //Alt View Instructions
    altViewInstructions: null,

    activePlayerGameDataConnector: new ActivePlayerGameDataConnector(),
    hostGameDataConnector: new HostGameDataConnector(),

    gameClass: null,
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

    //AKA activePlayerGameData in the DB
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

    //Global instructions - these apply to all players
    currentInstructions: function (n, o) {
      //Instructions

      this.quickLog(n + o);

      //Only update if the instructions are different (based on a shallow compare)
      if (n && !sgf.mainFramework.isObjectSimilar(n, o)) {
        if (!this.currentTargetedInstructions) {
          this.setupNewInstructions(n);
        }
      }
    },

    //Targeted Instructions - these can apply to a single player (this is going to be an array since multiple player may received unique targeted instructions)
    currentTargetedInstructions: function (n, o) {
      this.quickLog(n + o);

      let newTargeted = null,
        oldTargeted = null;

      if (n) newTargeted = n.find((x) => x.targetUserId == this.currentUserId);

      if (o) oldTargeted = o.find((x) => x.targetUserId == this.currentUserId);

      if (
        newTargeted &&
        !sgf.mainFramework.isObjectSimilar(newTargeted, oldTargeted)
      ) {
        this.setupNewInstructions(newTargeted);
      }
    },

    //Instructions for HUD
    currentHudInstructions: function (n, o) {
      //Instructions

      this.quickLog(n + o);

      //Only update if the instructions are different (based on a shallow compare)
      if (n && !sgf.mainFramework.isObjectSimilar(n, o)) {
        //TODO: Setup HUD instructions.......
        this.hudInstructions = n;
      } else if (!n && o) {
        this.hudInstructions = null;
      }
    },

    currentAltViewInstructions: function (n, o) {
      this.quickLog(n + o);

      //Only update if the instructions are different (based on a shallow compare)
      if (n && !sgf.mainFramework.isObjectSimilar(n, o)) {
        //TODO: Setup HUD instructions.......
        this.altViewInstructions = n;
      } else if (!n && o) {
        this.altViewInstructions = null;
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
    startGame: function (gameName) {
      let hostId = this.currentSession.currentUser.uniqueId;
      let roomName = this.currentRoomName;
      //this.selectedGame = gameName;

      this.gameRunner.setHost(hostId, roomName, gameName);
    },

    /**
     * Setup the current game by initializing the gameRunner and game.
     */
    setupGame: function () {
      let game = this.getGame(this.selectedGameName);

      if (game) {
        this.gameClass = game;

        this.gameRunner.setupCurrentGame(
          game,
          this.currentRoomName,
          this.hostId,
          this.currentSession.currentUser.uniqueId
        );

        this.listenToActivePlayerGameData();

        if (this.isHost) this.listenToHostGameData();
      }
    },

    /**
     * Clear local component display properties (main gameplay section ).
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

      //TODO - clean this up, it feels off
      if (instructions.comp == "QuestionAndAnswer")
        this.questionAndAnswerQuestionText = instructions.questionText;
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
      //...if this isn't a loop through
      else if (this.displayInstructions) {
        this.gameRunner.callGameFunction(
          this.displayInstructions.followUpFunction,
          this.getRemoteDataGroup,
          answer
        );

        this.clearDisplay();

        this.setUpDisplay(
          sgf.mainFramework.gameTools.buildSimpleDisplayInstructions(
            "LoadingScreen",
            "Loading",
            "Waiting for all players to finish..."
          )
        );
      }
    },

    cardTableEndTurnHandler: function (endResultObject) {
      this.gameRunner.callGameFunction(
        endResultObject.endTurnFunctionName,
        this.getRemoteDataGroup,
        endResultObject
      );
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

      this.gameClass = null;

      this.clearDisplay(); //Main Display clear
      this.currentGameComponent = "StartGameScreen";

      //Hud and Alt view clear
      this.hudInstructions = null;
      this.altViewInstructions = null;

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
        that.$store.commit(
          "setCurrentTargetedInstructions",
          remoteDocData.currentTargetedInstructions
        );

        that.$store.commit(
          "setCurrentHudInstructions",
          remoteDocData.currentHudInstructions
        );

        that.$store.commit(
          "setCurrentAltViewInstructions",
          remoteDocData.currentAltViewInstructions
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

    getGame: function (gameStr) {
      if (gameStr) {
        switch (gameStr) {
          case sgf.mainFramework.gameTools.gameList.MathMaster:
            return new MathMasterGame(this.currentRoomName);
          case sgf.mainFramework.gameTools.gameList.BlackJack:
            return new BlackJackGame(this.currentRoomName);
          default:
            return "";
        }
      }
    },

    setupNewInstructions: function (newInstructions) {
      if (newInstructions.type == "Display") {
        this.clearDisplay();
        this.setUpDisplay(newInstructions);
      }

      if (newInstructions.type == "LoopThrough") {
        this.clearDisplay();
        this.setUpLoopThrough(newInstructions);
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

.gameplay-tabs {
  margin-top: 5px;
}
</style>
