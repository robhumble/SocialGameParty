<template>
  <div class="experimental">
    <!-- <div>
      <h1>This is the experimental page.</h1>

      <v-btn @click="pushMeTest">Push Me</v-btn>
    </div> -->

    <br />

    <!-- <div style="text-align:center;" id="vuexTest">
      VUEX TESTING---------------------------------
      <label style="display:block">Vuex projectName</label>
      <br />
      <span>{{projectName}}</span>

      <br />
      <input v-model="newName" placeholder="new name...." />
      <v-btn @click="updateProjectName">Update project name!</v-btn>
    </div>-->

    <!-- <div style="text-align:center;" id="sessionTest">
      Session TESTING---------------------------------
      <label style="display:block">Current Session</label>
      <br />

      <div>
        <label style="display:block"><b>Current Room Name</b></label>        
        <span>{{currentRoomName}}</span>

        <br />

        <label style="display:block"><b>Current User</b></label>        
        <span>{{currentUserName + " | " + currentUserId}}</span>
        <br />
      </div>
      <br />
      <div style="border-style:solid">
        <input v-model="newRoomName" placeholder="new room name...." />
        <br>
        <input v-model="newUserName" placeholder="new user name...." />
        <br>
        <v-btn @click="updateSession">Update Session!</v-btn>
      </div>
    </div>-->

    <div style="text-align:center;">
      Math Master ---------------------------------
      <label style="display:block">Math Problem</label>
      <br />
      <v-btn @click="getMathProblem">Get New Problem!</v-btn>
      <br />
      <span v-if="mathProblem">{{mathProblem.presentationProblem}}</span>

      <br />
      <input v-model="mathAnswer" placeholder="math answer goes here...." />
      <v-btn @click="answerMathProblem">submit answer</v-btn>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import * as sgf from "@/logic/socialGameFramework.js";
import SessionInfo from "@/logic/SessionInfo.js";
import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
import MathMasterGameTools from "@/logic/MathMasterGameTools.js";

// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "Experimental",
  components: {},
  data: () => ({
    newName: null,

    newRoomName: null,
    newUserName: null,

    //Math Master testing

    mathProblem: null,
    mathAnswer: null,
  }),
  mounted: function () {},
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
