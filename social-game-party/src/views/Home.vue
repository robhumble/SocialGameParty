<template>
  <div>
    <!-- Room navigation. Still in progress. -->
    <v-container>
      <v-row v-if="!currentSession.currentUser.name" class="text-center">
        <v-col>
          <UserSetup></UserSetup>
        </v-col>
      </v-row>

      <v-row v-if="currentUserName" class="text-center">
        <v-col>
          <RoomMenu></RoomMenu>
          <GameRoom v-if="currentRoomName"></GameRoom>
        </v-col>
      </v-row>
    </v-container>
   
  </div>
</template>

<script>
// @ is an alias to /src
import { mapGetters } from "vuex";
import RoomMenu from "@/components/RoomParts/RoomMenu.vue";
import GameRoom from "@/components/RoomParts/GameRoom.vue";
import UserSetup from "@/components/UserSetup.vue";

export default {
  name: "Home",
  props: ["isDebug"],
  components: {
    RoomMenu,   
    UserSetup,
    GameRoom,
  },
  data: () => ({   
  }),
  computed: {
    ...mapGetters(["projectName", "currentSession", "currentRoomName","currentUserName"]),
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
  
  },
};
</script>

<style lang="scss" scoped>
</style>