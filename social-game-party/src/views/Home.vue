<template>
  <div>
    <!-- ===== Page Content ===== -->
    <v-container>
      <v-row class="text-center">
        <v-col cols="12">
          <v-btn v-if="!inChatRoom" @click="inChatRoom = true">Enter Chat Room</v-btn>
          <v-btn v-if="inChatRoom" @click="inChatRoom = false">Exit Chat Room</v-btn>
          <ChatRoom v-if="inChatRoom"></ChatRoom>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import ChatRoom from "@/components/ChatRoom.vue";

export default {
  name: "Home",
  components: {
    ChatRoom
  },
  data: () => ({
    inChatRoom: false
  })
};
</script>
