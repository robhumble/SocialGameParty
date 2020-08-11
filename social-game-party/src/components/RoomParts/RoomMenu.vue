<!-- This component lets the user choose what room they will join or make. -->
<template>
  <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="room-menu-card">
        <v-card-title class="text-center">Room Menu</v-card-title>

        <div class="room-status">
          <h1 v-if="!currentRoomName">You are not in a game room!</h1>
          <h1 v-if="currentRoomName">You are in room: {{currentRoomName}}</h1>
        </div>

        <!-- <div class="RoomMenu" style="max-width:60%">
        <h2>Room Menu</h2>-->
        <!-- prevent loading both options at once by making the other button's value false -->
        <div v-if="!currentRoomName && !joinARoom && !makeARoom" class="join-or-make">
          <h3>Would you like to:</h3>
          <v-btn @click="joinARoom = true">Join a room!</v-btn>
          <span style="font-weight:bold">Or</span>
          <v-btn @click="makeARoom = true">Make a new room!</v-btn>
        </div>
        <v-btn v-if="currentRoomName" @click="exitRoom">Exit!</v-btn>

        <!-- forms for joining and making rooms respectively -->
        <div v-if="joinARoom">
          <h3>What is your room name?</h3>
          <v-container align-center>
            <v-row>
              <v-col />
              <v-col>
                <v-text-field outlined v-model="joinRoomName"></v-text-field>
              </v-col>
              <v-col >
                <v-btn @click="joinRoom(joinRoomName)">Join</v-btn>
              </v-col>
              <v-col >
                <v-btn @click="resetNavProperties">Cancel</v-btn>
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
              <v-col >
                <v-btn @click="makeRoom(makeRoomName)">Make</v-btn>
              </v-col>
              <v-col >
                <v-btn @click="resetNavProperties">Cancel</v-btn>
              </v-col>
              <v-col />
            </v-row>
          </v-container>
        </div>
      </v-card>
    </div>  
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import DataConnector from "@/logic/DataConnector.js";

export default {
  data() {
    return {
      currentRoomName: "", //current room name
      joinARoom: false, // Join Room "state"
      makeARoom: false, // Make Room "state"
      joinRoomName: "", //name of room to find/join
      makeRoomName: "", //name of room to create
      dataConnector: new DataConnector(),      
    };
  },
  mounted: function () {
    this.attemptToRejoinRoom();
  },
  computed: {
    ...mapGetters(["currentSession","userList"]),
    
   
  },
  methods: {
    //Create a room
    makeRoom(makeRoomName) {
      let curUser = this.getDbModelFromCurrentUser();

      this.dataConnector.makeRoom(makeRoomName, curUser);

      this.updateCurrentRoom(makeRoomName);

      this.resetNavProperties();
    },

    // //Join an existing room
    joinRoom(joinRoomName) {
      let curUser = this.getDbModelFromCurrentUser();

      this.dataConnector.joinRoom(joinRoomName, curUser, this.updateCurrentRoom);

      this.resetNavProperties();
    },

    // //Leave the users current room
    exitRoom() {
      this.dataConnector.exitRoom(
        this.currentSession.currentUser.uniqueId,
        this.currentRoomName
      );

      this.updateCurrentRoom("");

      this.resetNavProperties();
    },    

    //Get list of users in the current room
    listenToRoomUsers: function () {
      // allows us to use a reference to the class data outside of the dataConnector method
      var that = this;

      this.dataConnector.listenToUsers(function (remoteUserList) {
     
        that.$store.commit("setUserList",remoteUserList);

      }, that.currentRoomName);
    },

    attemptToRejoinRoom: function () {
      let roomFromPreviousSession = this.currentSession.currentRoom.name;
      let curUser = this.getDbModelFromCurrentUser();

      if (roomFromPreviousSession) {
        this.dataConnector.rejoinRoom(
          roomFromPreviousSession,
          curUser,
          this.updateCurrentRoom
        );
      }
    },

    //Helpers--------------------------------------
    //reset common nav/menu properties
    resetNavProperties() {
      this.joinARoom = false;
      this.makeARoom = false;
      this.joinRoomName = "";
      this.makeRoomName = "";      
    },

    updateCurrentRoom: function (newRoomName) {
      this.$store.dispatch("UpdateCurrentRoomName", newRoomName);
      this.currentRoomName = newRoomName;

      if (newRoomName) this.listenToRoomUsers();
    },

    //Get a representation for the user that we want to use in the database.
    getDbModelFromCurrentUser: function () {
      let userDbModel = {
        id: this.currentSession.currentUser.uniqueId,
        name: this.currentSession.currentUser.name,
        isPlaying: false,
      };

      return userDbModel;
    },

    clearCurrentRoom: function () {
      this.updateCurrentRoom("");
    },
  },
};
</script>

<style lang="scss" scoped>
.room-menu-card {
  color: #dd2c00 !important;
  border-color: #dd2c00 !important;
  padding: 5px;
}
</style>