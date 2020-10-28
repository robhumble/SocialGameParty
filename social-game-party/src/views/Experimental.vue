<template>
  <div class="experimental">
    <CardTable></CardTable>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import * as sgf from "@/logic/socialGameFramework.js";
import SessionInfo from "@/logic/SessionInfo.js";
import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
import MathMasterGameTools from "@/logic/Games/MathMasterGame.js";
// import QuestionAndAnswer from "@/components/GameParts/QuestionAndAnswer.vue"
// import ResultScreen from "@/components/GameParts/ResultScreen.vue"

import CardTable from "@/components/CardParts/CardTable.vue";

// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "Experimental",
  components: {
    // QuestionAndAnswer,
    // ResultScreen
    CardTable,
  },
  data: () => ({}),
  mounted: function () {
    if (this.isDebug) this.$store.commit("setIsDebugMode", true);

    this.quickLog("Made it to Experimental!");
  },
  computed: {
    ...mapGetters(["projectName", "currentSession"]),

    currentRoomName: function () {
      if (
        this.currentSession &&
        this.currentSession.currentRoom &&
        this.currentSession.currentRoom.name
      )
        return this.currentSession.currentRoom.name;
      return "";
    },
    currentUserId: function () {
      if (
        this.currentSession &&
        this.currentSession.currentUser &&
        this.currentSession.currentUser.uniqueId
      )
        return this.currentSession.currentUser.uniqueId;
      return "";
    },
    currentUserName: function () {
      if (
        this.currentSession &&
        this.currentSession.currentUser &&
        this.currentSession.currentUser.name
      )
        return this.currentSession.currentUser.name;
      return "";
    },
  },
  watch: {},
  methods: {
    pushMeTest: function () {
      alert("The frameworks name is: " + sgf.mainFramework.name);
      var x = 2;
      var y = 3;
      alert(`${x} + ${y} = ${sgf.mainFramework.addStuff(x, y)} `);
    },

    updateProjectName() {
      this.$store.commit("setProjectName", this.newName);
    },

    updateSession() {
      let room = new SessionRoom(this.newRoomName);
      let usr = new SessionUser(1, this.newUserName);

      let sess = new SessionInfo(room, usr);

      this.$store.dispatch("UpdateCurrentSession", sess);
    },

    //Math Master testing-==-=-=-=-=-=-=-=-

    getMathProblem() {
      this.resetMathStuff();
      let tools = new MathMasterGameTools();

      this.mathProblem = tools.buildMathProblem();
    },

    answerMathProblem() {
      if (this.mathAnswer == this.mathProblem.answer)
        alert("Correct Answer, you are great!");
      else alert("Incorrect Answer, you fail!");
    },

    resetMathStuff() {
      this.mathProblem = null;
      this.mathAnswer = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.experimental {
  text-align: center;
}
</style>
