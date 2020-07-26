<template>
  <div>
    <!-- ===== Page Content ===== -->
    <!-- Chat Room as Right Nav -->
    <v-container>
      <v-navigation-drawer
        v-model="drawer"
        color="deep-orange accent-4"
        :mini-variant="hideChat"
        :right="true"
        :permanent="true"
        absolute
      >
        <div class="chat-controls" @click="toggleHideChat">
          <v-icon color="white" large>mdi-chat</v-icon>
          <h2 v-show="!hideChat" >Chat!</h2>
        </div>

        <v-container v-show="!hideChat">
          <v-row class="text-center">
            <v-col cols="12">
              <v-btn v-if="!inChatRoom" @click="inChatRoom = true">Enter Chat Room</v-btn>
              <v-btn v-if="inChatRoom" @click="inChatRoom = false">Exit Chat Room</v-btn>
              <ChatRoom v-if="inChatRoom"></ChatRoom>
            </v-col>
          </v-row>
        </v-container>
      </v-navigation-drawer>

      <!-- Room navigation. Still in progress. -->
      <v-container>
        <v-row class="text-center">
          <v-col>
            <NewRoom></NewRoom>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import ChatRoom from "@/components/ChatRoom.vue";
import NewRoom from "@/components/NewRoom.vue";

export default {
  name: "Home",
  components: {
    NewRoom,
    ChatRoom,
  },
  data: () => ({
    inChatRoom: false,

    hideChat: true,
    drawer: true,
  }),
  methods: {
    toggleHideChat() {
      if (this.hideChat) this.hideChat = false;
      else this.hideChat = true;
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