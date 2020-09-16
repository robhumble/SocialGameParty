<template>
  <div>
    <v-chip v-if="!isEditMode" class="user-info-chip" @click="tryToEdit">
      <v-icon color="white" large>mdi-account-settings</v-icon>
      {{currentUserName}}
    </v-chip>

    <div v-if="isEditMode">
      <v-container>
        <v-row>
          <v-col>
            <v-form class="user-setup-main">
              <h1>Provide a name to display to other users.</h1>
              <v-text-field
                outlined
                v-model="userDisplayName"
                label="Display Name"
                placeholder="Type Display Name Here..."
              ></v-text-field>

              <v-btn @click="updateCurrentUserName">Update Display Name</v-btn>
              <v-btn v-if="currentUserName" @click="isEditMode=false">Cancel</v-btn>
            </v-form>
          </v-col>
          <v-col v-if="currentUserName"></v-col>
          <v-col v-if="currentUserName"></v-col>
        </v-row>
      </v-container>
    </div>
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
    isEditMode: false,
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
        this.isEditMode = false;
      }
    },

    tryToEdit() {
      if (this.currentRoomName)
        alert(
          "If you would like to update your display name, please leave the current room and try again!"
        );
      else this.isEditMode = true;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.user-setup-main {
  text-align: center;
  border-style: solid;
  border-color: $social-game-party-orange !important;
}

.user-info-chip {
  color: $social-game-party-white !important;
  border-color: $social-game-party-blue !important;
  background-color: $social-game-party-blue !important;
}
</style>
