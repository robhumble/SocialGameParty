<template>
  <div class="user-setup-main">
    <v-form>
      <v-container>
        <v-row>
          <v-col>
            <h1>Provide a name to display to other users.</h1>
            <v-text-field outlined v-model="userDisplayName" label="Display Name" placeholder="Type Display Name Here..."></v-text-field>
          </v-col>
        </v-row>
        <v-btn @click="updateCurrentUserName">Update Display Name</v-btn>
      </v-container>
    </v-form>
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
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),    
  },
  watch: {},
  methods: {

    updateCurrentUserName(){
      this.$store.dispatch("UpdateCurrentUserDisplayName", this.userDisplayName );
    }
 
  },
};
</script>
<style lang="scss" scoped>
.user-setup-main {
  text-align: center;
  border-style: solid;
  border-color: rgb(221, 44, 0) !important;
}
</style>
