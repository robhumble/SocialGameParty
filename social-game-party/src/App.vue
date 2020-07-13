<template>
  <v-app>
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
        <h1  class="d-none d-lg-flex">Social Game Party Thing!</h1>
        <h1 class="d-lg-none"> SGPT!</h1> 
      </div>

      <v-spacer></v-spacer>

      <h2>ChittyChatty POC</h2>
    </v-app-bar>

    <v-content>
      <!-- Tie in vue router router-view component here in the future ... Until then we do this -->


      <!-- ===PAGE CONTENT=== -->
      <v-container>
        <v-row class="text-center">
          <v-col cols="12">
            <v-btn v-if="!inChatRoom" @click="inChatRoom = true">Enter Chat Room</v-btn>
            <v-btn v-if="inChatRoom" @click="inChatRoom = false">Exit Chat Room</v-btn>
            <ChatRoom v-if="inChatRoom"></ChatRoom>
          </v-col>
        </v-row>
      </v-container>

    </v-content>
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';
import ChatRoom from "./components/ChatRoom";

export default {
  name: "App",

  components: {
    //HelloWorld,
    ChatRoom
  },

  data: () => ({
    //
    inChatRoom: false
  })
};
</script>
