<template>
  <div style="text-align: center">
    <div class="score-board d-flex justify-space-around">
      <!-- <div v-for="hp in altViewInfo" :key="hp.title" class="score-board-part">
        <b>{{ hp.title }}</b> : {{ hp.data }}
      </div> -->

      <div
        v-for="sc in altViewInfo"
        :key="sc.playerName"
        class="score-board-part"
      >
        <v-card class="mx-auto my-1" width="20vw">
          <v-card-title>{{ sc.playerName }}</v-card-title>
          <v-card-text>
            <v-row v-for="d in sc.details" :key="d.title" class="mx-0 my-1">
              <b>{{ d.title }}</b> : <span v-html="d.data"></span>
            </v-row>
          </v-card-text>
        </v-card>
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
  name: "ScoreBoard",
  components: {},
  props: ["altViewInfoData", "gameClass", "altViewInfoFuncName"],
  data: () => ({
    // loadingMessageText: "",
    altViewInfo: [],
  }),
  mounted: function () {
    if (this.altViewInfoData) this.altViewInfo = this.altViewInfoData;
    else if (this.gameClass && this.altViewInfoFuncName)
      this.altViewInfo = this.gameClass[this.altViewInfoFuncName](
        this.getRemoteDataGroup,
        this.currentUserId
      );
    else
      this.quickLog(
        "No instuctions provided to populate Alt View Info provided!"
      );
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
        if (this.gameClass && this.altViewInfoFuncName)
          this.altViewInfo = this.gameClass[this.altViewInfoFuncName](
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

.score-board {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-style: solid;
  border-color: $social-game-party-orange !important;
}
// .score-board-part{
//   // display: flex;
//   margin: 10px;
// }
</style>
