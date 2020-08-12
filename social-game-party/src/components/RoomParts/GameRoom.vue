<!-- This component lets the user choose what room they will join or make. -->
<template>
  <div class="game-room">
    <!-- </div> -->
    <!-- code to be ripped from NewRoom and put in GameRoom -->
    <div v-if="currentRoomName">
      <div v-if="!inGame">
        <h3>You are currently spectating.</h3>
        <v-btn @click="joinGame">Join Game</v-btn>
      </div>
      <div v-if="inGame">
        <h3>You are in game!</h3>
        <v-btn @click="exitGame()">Leave Game</v-btn>
      </div>
      <h2 v-if="currentRoomName">Specators In Room: {{peopleSpectating}}</h2>
      <h2 v-if="currentRoomName">Active Players In Room: {{peoplePlaying}}</h2>
    </div>
    <!-- end gameroom block -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RoomDataConnector from "@/dataConnectors/RoomDataConnector.js";

export default {
  data() {
    return {
        dataConnector: new RoomDataConnector(),
      inGame: false,
    };
  },
  mounted: function () {},
  computed: {
    ...mapGetters(["currentSession", "userList"]),

    peopleSpectating: function () {
      let userStr = "";

      this.userList
        .filter((x) => !x.isPlaying)
        .forEach(function (user) {
          //let appendName = Object.values(user);
          let appendName = user.name;
          if (appendName != "") {
            userStr += `${appendName}, `;
          }
        });

      return userStr;
    },

    peoplePlaying: function () {
      let userStr = "";

      this.userList
        .filter((x) => x.isPlaying)
        .forEach(function (user) {
          //let appendName = Object.values(user);
          let appendName = user.name;
          if (appendName != "") {
            userStr += `${appendName}, `;
          }
        });

      return userStr;
    },

    currentRoomName: function(){
        return this.currentSession?.currentRoom?.name;
    }
  },
  methods: {
    // // gameRoom methods

    // //Join the game in the current room
    joinGame() {
      let userId = this.currentSession?.currentUser?.uniqueId;

      this.dataConnector.joinGame(userId, this.currentRoomName);

      this.inGame = true;
    },

    // //exit the current game but stay in the room
    exitGame() {
      let userId = this.currentSession?.currentUser?.uniqueId;

      this.dataConnector.exitGame(userId, this.currentRoomName);
    
      this.inGame = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.game-room {  
  color: black;
  border-style: solid;
  border-color:  #dd2c00 !important;;
  padding: 5px;
  margin: 5px;
  min-height: 50vh;  
}
</style>