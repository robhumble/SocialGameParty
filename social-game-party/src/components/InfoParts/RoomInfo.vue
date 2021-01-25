<!-- This component lets the user choose what room they will join or make. -->
<template>
  <div>
    <v-btn class="room-info-chip" v-if="currentRoomName" disabled>
      <v-icon color="white" medium>mdi-home-variant-outline</v-icon>
      ROOM | {{ currentRoomName }}
    </v-btn>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {};
  },
  mounted: function () {},
  computed: {
    ...mapGetters([
      "currentSession",
      "userList",
      "isCurrentUserInGame",
      "currentRoomName",
    ]),
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "@/assets/custom.scss";

.room-info-chip {
  color: $social-game-party-white !important;
  border-color: $social-game-party-blue !important;
  background-color: $social-game-party-blue !important;
}

.v-btn {
  margin: 2px;
}
</style>