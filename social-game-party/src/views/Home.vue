<template>
  <div>
    <!-- ===== Page Content ===== -->

    <!-- Room navigation. Still in progress. -->
    <v-container>
      <v-row class="text-center">  
        <v-col>
          <NewRoom></NewRoom>
        </v-col>
      </v-row>
    </v-container>
    
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
import NewRoom from "@/components/NewRoom.vue";

export default {
  name: "Home",
  components: {
    NewRoom,
    ChatRoom
  },
  data: () => ({
    inChatRoom: false
  })
};
</script>
