<!-- This component lets the user choose what room they will join or make. -->
<template>
  <div>
    <div v-if="currentRoomName" class="game-room">
      <div>
        <div>
          <h4 v-if="currentRoomName">Specators:</h4>
          <span>{{ peopleSpectating }}</span>
          <h4 v-if="currentRoomName">Active Players:</h4>
          <span>{{ peoplePlaying }}</span>
        </div>
        <div v-if="inGame">
          <h3>You are in game!</h3>
          <!-- <v-btn @click="exitGame()">Leave Game</v-btn> -->
        </div>

        <div v-if="!inGame">
          <h3>You are currently spectating.</h3>
          <v-btn v-if="!hostId" @click="joinGame">Join Game</v-btn>
        </div>
      </div>
      <!-- Actual Game Area -->
      <MainGameplayArea
        v-if="currentRoomName && inGame"
        @exitGame="exitGame"
        class="main-gameplay-area"
      ></MainGameplayArea>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RoomDataConnector from "@/dataConnectors/RoomDataConnector.js";
import MainGameplayArea from "@/components/GameParts/MainGameplayArea.vue";

export default {
  data() {
    return {
      dataConnector: new RoomDataConnector(),
      inGame: false,
    };
  },
  components: {
    MainGameplayArea,
  },
  mounted: function () {},
  computed: {
    ...mapGetters(["currentSession", "userList", "currentRoomName", "hostId"]),

    peopleSpectating: function () {
      let userStr = "";

      this.userList
        .filter((x) => !x.isPlaying)
        .forEach(function (user) {
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
          let appendName = user.name;
          if (appendName != "") {
            userStr += `${appendName}, `;
          }
        });

      return userStr;
    },
  },
  methods: {
    // gameRoom methods

    //Join the game in the current room
    joinGame() {
      let userId = this.currentSession?.currentUser?.uniqueId;

      this.dataConnector.joinGame(userId, this.currentRoomName);

      this.inGame = true;
    },

    //exit the current game but stay in the room
    exitGame() {
      let userId = this.currentSession?.currentUser?.uniqueId;
      this.dataConnector.exitGame(userId, this.currentRoomName);

      this.inGame = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/custom.scss";

.game-room {
  animation: fade-in 3s 1;
  color: white;
  border-style: solid;
  border-color: $social-game-party-orange !important;
  padding: 5px;
  margin: 5px;
  min-height: 50vh;
  background-color: $social-game-party-orange;
  border-radius: 5px;
}

.main-gameplay-area {
  animation: fade-in 5s 1;
  position: relative;
}

@keyframes slide-up-and-fade-in {
  // 0%   { top: 110vh; opacity: 0;}
  // 100% {top: 0px; opacity: 1;}

  0% {
    top: 2000px;
  }
  100% {
    top: 0px;
  }
}
</style>

