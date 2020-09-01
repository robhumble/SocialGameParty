<template>
  <div>
    <!-- ===== Page Content ===== -->
    <div class="chat-controls float-right" @click="toggleShowChat">
      <v-icon color="deep-orange accent-4" large>mdi-chat</v-icon>
    </div>

    <!-- Right Side Nav panel -->
    <v-navigation-drawer
      v-model="showChat"
      color="deep-orange accent-4"
      :right="true"
      fixed
      temporary
    >
      <!-- Chat Room -->
      <div class="chat-controls" @click="toggleShowChat">
        <v-icon color="white" large>mdi-chat</v-icon>
        <h2 v-show="showChat">Chat!</h2>

        <!-- <v-icon class="float-right" color="white" medium>mdi-arrow-collapse-right</v-icon> -->
      </div>

      <v-container v-show="showChat">
        <v-row class="text-center">
          <v-col cols="12">
            <v-btn v-if="!inChatRoom" @click="inChatRoom = true">Enter Chat Room</v-btn>
            <v-btn v-if="inChatRoom" @click="inChatRoom = false">Exit Chat Room</v-btn>
            <ChatArea v-if="inChatRoom" :isGlobal="!currentRoomName"></ChatArea>
          </v-col>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <!-- Room navigation. Still in progress. -->
    <v-container>
      <v-row v-if="!currentSession.currentUser.name" class="text-center">
        <v-col>
          <UserSetup></UserSetup>
        </v-col>
      </v-row>

      <v-row class="text-center">
        <v-col>
          <RoomMenu></RoomMenu>
          <GameRoom></GameRoom>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from "vuex";
import ChatArea from "@/components/ChatArea.vue";
import RoomMenu from "@/components/RoomParts/RoomMenu.vue";
import GameRoom from "@/components/RoomParts/GameRoom.vue";
import UserSetup from "@/components/UserSetup.vue";

export default {
  name: "Home",
  props: ["isDebug"],
  components: {
    RoomMenu,
    ChatArea,
    UserSetup,
    GameRoom,
  },
  data: () => ({
    inChatRoom: false,
    showChat: false,
  }),
  computed: {
    ...mapGetters(["projectName", "currentSession", "currentRoomName"]),
  },
  mounted: function () {
    if (this.isDebug) this.$store.commit("setIsDebugMode", true);
  },
  watch: {
    currentRoomName: function () {
      this.inChatRoom = false;
    },
  },
  methods: {
    toggleShowChat() {
      if (this.showChat) this.showChat = false;
      else this.showChat = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-controls {
  color: white;
  font-weight: bold;
  display: flex;
}
</style>