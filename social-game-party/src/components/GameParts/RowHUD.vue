<template>
  <div style="text-align: center">
    <div class="hud-row d-flex justify-space-around">
      <div v-for="hp in hudInfo" :key="hp.title" class="hud-part">
        <b>{{ hp.title }}</b> : {{ hp.data }}
      </div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "RowHUD",
  components: {},
  props: ["hudInfoData", "gameClass", "hudInfoFunc"],
  data: () => ({
    // loadingMessageText: "",
    hudInfo: [],
  }),
  mounted: function () {
    if (this.hudInfoData) this.hudInfo = this.hudInfoData;
    else if (this.gameClass && this.hudInfoFunc)
      this.hudInfo = this.gameClass[this.hudInfoFunc](
        this.getRemoteDataGroup,
        this.currentUserId
      );
    else this.quickLog("No instuctions provided to populate HUD provided!");
  },
  computed: {
    ...mapGetters([
      "projectName",
      "currentSession",
      "getRemoteDataGroup",
      "currentUserId",
      "playerGameData",
    ]),
  },
  watch: {
    //If the playerGameData is update and this is using a class function for it's data source, run it again.
    playerGameData: function (n, o) {
      if (n != o) {
        if (this.gameClass && this.hudInfoFunc)
          this.hudInfo = this.gameClass[this.hudInfoFunc](
            this.getRemoteDataGroup,
            this.currentUserId
          );
      }
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";

.hud-row {
  // display: flex;
  // flex-direction: column;
  justify-content: center;
  align-items: center;
  border-style: solid;
  border-color: $social-game-party-orange !important;
  margin: 5px 0px 5px 0px;
}
// .hud-part{
//   // display: flex;
//   margin: 10px;
// }
</style>
