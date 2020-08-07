<!-- This component lets the user choose what room they will join or make. -->
<template>
  <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="room-menu-card">
        <v-card-title class="text-center">Room Menu</v-card-title>

        <div class="room-status">
          <h1 v-if="!clientInRoom">You are not in a game room!</h1>
          <h1 v-if="clientInRoom">You are in room: {{clientInRoom}}</h1>
        </div>

        <!-- <div class="RoomMenu" style="max-width:60%">
        <h2>Room Menu</h2>-->
        <!-- prevent loading both options at once by making the other button's value false -->
        <div v-if="!clientInRoom && !joinARoom && !makeARoom" class="join-or-make">
          <h3>Would you like to:</h3>
          <v-btn @click="joinARoom = true">Join a room!</v-btn>
          <span style="font-weight:bold">Or</span>
          <v-btn @click="makeARoom = true">Make a new room!</v-btn>
        </div>
        <v-btn v-if="clientInRoom" @click="exitRoom">Exit!</v-btn>

        <!-- forms for joining and making rooms respectively -->
        <div v-if="joinARoom">
          <h3>What is your room name?</h3>
          <v-container align-center>
            <v-row>
              <v-col />
              <v-col>
                <v-text-field outlined v-model="joinRoomName"></v-text-field>
              </v-col>
              <v-col @click="joinRoom(joinRoomName)">
                <v-btn>Join</v-btn>
              </v-col>
              <v-col />
            </v-row>
          </v-container>
        </div>
        <div v-if="makeARoom">
          <h3>What will you name your room?</h3>
          <v-container align-center>
            <v-row>
              <v-col />
              <v-col>
                <v-text-field outlined v-model="makeRoomName"></v-text-field>
              </v-col>
              <v-col @click="makeRoom(makeRoomName)">
                <v-btn>Make</v-btn>
              </v-col>
              <v-col />
            </v-row>
          </v-container>
        </div>
      </v-card>
    </div>

    <!-- </div> -->
    <!-- code to be ripped from NewRoom and put in GameRoom -->
    <div v-if="clientInRoom">
      <h3 v-if="!inGame">You are currently spectating.</h3>
      <h3 v-if="inGame">You are in game!</h3>
      <v-btn v-if="!clientIsPlayer" @click="wantToJoin=true;">Join Game</v-btn>
      <v-btn v-if="clientIsPlayer" @click="exitGame()">Exit Game</v-btn>

      <v-container align-center v-if="wantToJoin">
        <v-row>
          <v-col>
            <!-- <v-text-field outlined v-model="clientIsPlayer" placeholder="Type Username Here"></v-text-field> -->
            Are you sure you want to join?
          </v-col>
          <v-col @click="joinGame()">
            <v-btn>Join</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <h2 v-if="clientInRoom">Players In Game: {{userList}}</h2>
    </div>
    <!-- end gameroom block -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import DataConnector from "@/logic/DataConnector.js";

export default {
  data() {
    return {
      clientInRoom: "", //current room name
      joinARoom: false, // Join Room "state"
      makeARoom: false, // Make Room "state"
      joinRoomName: "", //name of room to find/join
      makeRoomName: "", //name of room to create
      dataConnector: new DataConnector(),
      // This user ID is created whenever the client loads the home page.
      sessionID: Math.round(Math.random() * 1000000), //user id

      // gameRoom data
      clientIsPlayer: "", //current user/player name
      wantToJoin: false,
      inGame: false,
      userList: "", //list of all users in the current game.
    };
  },
  computed: {
    ...mapGetters(["currentSession"]),
  },
  methods: {
    //Create a room
    makeRoom(makeRoomName) {
      this.dataConnector.makeRoom(
        makeRoomName,
        this.sessionID,
        this.clientInRoom
      );
      this.clientInRoom = makeRoomName;
      this.resetCommonProperties();

      this.setupUserDisplay();
    },

    //Join an existing room
    joinRoom(joinRoomName) {
      let success = this.dataConnector.joinRoom(
        joinRoomName,
        this.sessionID,
        this.clientInRoom
      );
      if (success) {
        this.clientInRoom = joinRoomName;
      }
      this.resetCommonProperties();

      this.setupUserDisplay();
    },

    //Leave the users current room
    exitRoom() {
      this.dataConnector.exitRoom(this.sessionID, this.clientInRoom);
      this.clientInRoom = "";
      this.resetCommonProperties();
    },

    //helpers-----------------------------

    //reset common nav/menu properties
    resetCommonProperties() {
      this.joinARoom = false;
      this.makeARoom = false;
      this.joinRoomName = "";
      this.makeRoomName = "";

      this.inGame = false;
      this.wantToJoin = false;
    },

    // gameRoom methods

    //Join the game in the current room
    joinGame() {
      let displayName = this.currentSession?.currentUser?.name;

      if (displayName) {
        this.dataConnector.joinGame(
          this.sessionID,
          //this.clientIsPlayer,
          displayName,
          this.clientInRoom
        );

        this.inGame = true;
        this.wantToJoin = false;
      } else alert("You must have a display to join a game !");
    },

    //exit the current game but stay in the room
    exitGame() {
      this.dataConnector.exitGame(this.sessionID, this.clientInRoom);
      this.clientIsPlayer = "";
      this.inGame = false;
      this.wantToJoin = false;
    },

    //Get list of users in the current room
    setupUserDisplay: function () {
      // allows us to use a reference to the class data outside of the dataConnector method
      var that = this;

      this.dataConnector.listenToUsers(function (remoteUserList) {
        let tempUserList = "";
        // remoteUserList = JSON.parse(remoteUserList);

        remoteUserList.forEach(function (user) {
          let appendName = Object.values(user);
          if (appendName != "") {
            tempUserList += `${appendName}, `;
          }
        });
        that.userList = tempUserList;
        //console.log("There may have been an update to the user list.");
      }, that.clientInRoom);
    },
  },
};
</script>

<style lang="scss" scoped>
.room-menu-card {
  color: #dd2c00 !important;
  border-color: #dd2c00 !important;
}
</style>