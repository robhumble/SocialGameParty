<template>
  <v-app>
    <!-- ===== Nav Bar ===== -->
    <v-app-bar app color="deep-orange accent-4" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/Puzzle_OrangeFace.png')"
          transition="scale-transition"
          width="40"
        />
        <h1 class="d-none d-lg-flex">Social Game Party Thing!</h1>
        <h1 class="d-lg-none">SGPT!</h1>
      </div>

      <v-spacer></v-spacer>

      <h2 class="d-none d-lg-flex">Game Night</h2>
    </v-app-bar>

    <v-content>
      <div>
        <span>
          !!!DEBUG!!! ---> 
          Current User name:
          <b>{{currentUserName}}</b>
          ||| User UniqueID : {{currentUserId}}
          ||| Room Name : {{currentRoomName}}
        </span>
        <v-btn small @click="clearSessionFromMemory">Clear Memory!</v-btn>
      </div>

      <!-- ===== Router views/components injected here ===== -->
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "App",
  components: {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),

    currentUserName: function () {
      if (this.currentSession)
        return this.currentSession.currentUser.name ?? "Nada";
      return "Nada";
    },

    currentUserId: function () {
      if (this.currentSession)
        return this.currentSession.currentUser.uniqueId ?? "Nada";
      return "Nada";
    },

    currentRoomName: function () {
      if (this.currentSession)
        return this.currentSession.currentRoom.name ?? "Nada";
      return "Nada";
    },
  },
  methods: {
    clearSessionFromMemory() {
      this.$store.dispatch("clearSession");
    },
  },
};
</script>
