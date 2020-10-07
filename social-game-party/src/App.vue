<template>
  <!-- SEE THIS PAGE ( https://vuetifyjs.com/en/components/application/ ) for important vuetify design guidelines - not following this can break responsive designs... -->
  <v-app>
    <!-- ===== Nav Bar ===== -->
    <v-app-bar app color="deep-orange accent-4" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/SocialGameParty.png')"
          transition="scale-transition"
          width="110"
        />
        <h1 v-if="isDebugMode" class="d-none d-lg-flex">
          DEBUG PARTY DEBUG PARTY DEBUG PARTY
        </h1>
        <h1 v-else class="d-none d-lg-flex">Social Game Party Thing!</h1>

        <h1 class="d-lg-none">SGPT!</h1>
      </div>

      <v-spacer></v-spacer>

      <h2 class="d-none d-lg-flex">Game Night</h2>
    </v-app-bar>

    <!-- Right Side Nav panel -->
    <!-- ***Only show this when the user is currently in a "room" -->
    <v-navigation-drawer
      v-show="currentRoomName"
      v-model="showChat"
      color="deep-orange accent-4"
      :right="true"
      fixed
      temporary
      app
    >
      <!-- Chat Room -->
      <div class="chat-controls" @click="toggleShowChat">
        <v-icon color="white" large>mdi-chat</v-icon>
        <h2 v-show="showChat">Chat!</h2>
      </div>

      <v-container v-show="showChat">
        <v-row class="text-center">
          <v-col cols="12">
            <v-btn v-if="!inChatRoom" @click="inChatRoom = true"
              >Enter Chat Room</v-btn
            >
            <v-btn v-if="inChatRoom" @click="inChatRoom = false"
              >Exit Chat Room</v-btn
            >
            <ChatArea v-if="inChatRoom"></ChatArea>
          </v-col>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <!-- ===== Page Content ===== -->
        <div v-if="isDebugMode">
          <span>
            !!!DEBUG!!! ---> Current User name:
            <b>{{ currentUserName }}</b>
            ||| User UniqueID : {{ currentUserId }} ||| Room Name :
            {{ currentRoomName }}
          </span>
          <v-btn small @click="clearSessionFromMemory">Clear Memory!</v-btn>
        </div>

        <v-icon
          v-show="currentRoomName"
          @click="toggleShowChat"
          color="deep-orange accent-4"
          large
          class="float-right"
          >mdi-chat</v-icon
        >

        <!-- ===== Router views/components injected here ===== -->
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import ChatArea from "@/components/ChatArea.vue";
export default {
  name: "App",
  components: {
    ChatArea,
  },
  data: () => ({
    inChatRoom: false,
    showChat: false,
  }),
  computed: {
    ...mapGetters([
      "projectName",
      "currentSession",
      "isDebugMode",
      "currentRoomName",
      "currentUserName",
    ]),

    currentUserId: function () {
      if (this.currentSession)
        return this.currentSession.currentUser.uniqueId ?? "Nada";
      return "Nada";
    },
  },
  methods: {
    clearSessionFromMemory() {
      this.$store.dispatch("clearSession");
    },

    toggleShowChat() {
      if (this.showChat) this.showChat = false;
      else this.showChat = true;
    },
  },
};
</script>

<style lang="scss">
@import "assets/custom.scss";

.chat-controls {
  color: white;
  font-weight: bold;
  display: flex;
}
</style>
