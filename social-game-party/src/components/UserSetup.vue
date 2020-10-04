<template>
  <div>   
    <v-btn class="user-info-chip" @click="tryToEdit">
        <v-icon color="white" large>mdi-account-settings</v-icon>
        {{currentUserName}}
    </v-btn>  
    <span v-if="!currentUserName && !isDialogOpen"> &#x3C;- Use the blue button to choose a username. </span> 
    <v-dialog 
      v-model="isDialogOpen"
      persistent
      width=650
    >
      <div class="user-setup-main">
        <h1>Provide a name to display to other users.</h1>
        <v-text-field
          outlined
          v-model="userDisplayName"
          label="Display Name"
          placeholder="Type Display Name Here..."
        ></v-text-field>
        <v-btn @click="updateCurrentUserName">Update Name</v-btn>
        <v-btn v-if="currentUserName" @click="isDialogOpen=false">close</v-btn>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "UserSetup",
  components: {},
  data: () => ({
    userDisplayName: null,
    isDialogOpen: false,
  }),
  mounted: function () {
    if (!this.currentUserName) this.tryToEdit();
  },
  computed: {
    ...mapGetters([
      "projectName",
      "currentSession",
      "currentUserName",
      "currentRoomName",
    ]),
  },
  watch: {},
  methods: {
    updateCurrentUserName() {
      if (this.userDisplayName) {
        this.$store.dispatch(
          "UpdateCurrentUserDisplayName",
          this.userDisplayName
        );
        this.isDialogOpen = false;
      }
    },

    tryToEdit() {
      if (this.currentRoomName)
        alert(
          "If you would like to update your display name, please leave the current room and try again!"
        );
      else this.isDialogOpen=true;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.user-setup-main {
  text-align: center;
  border-style: solid;
  color: $social-game-party-blue !important;
  border-color: $social-game-party-blue !important;
  background-color: white;
  padding: 5px;
}

.user-info-chip {
  color: $social-game-party-white !important;
  border-color: $social-game-party-blue !important;
  background-color: $social-game-party-blue !important;
}

.v-btn {
  margin: 2px;
}
</style>
