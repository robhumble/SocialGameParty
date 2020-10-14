<template>
  <div style="text-align: center"></div>
</template>


<script>
import { mapGetters } from "vuex";
// import * as sgf from "@/logic/socialGameFramework.js";
// import SessionInfo from "@/logic/SessionInfo.js";
// import { SessionRoom, SessionUser } from "@/logic/SessionInfo.js";
// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "VisualCard",
  components: {},
  props: [],
  data: () => ({
    // loadingMessageText: "",
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),
  },
  watch: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
@import "@/assets/custom.scss";
</style>
