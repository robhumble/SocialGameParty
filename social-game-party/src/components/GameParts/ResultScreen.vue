<template>
   <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="result-card ">
        <v-card-title class="text-center">Results</v-card-title>

        <h1>{{resultTitle}}</h1>
        <p>{{resultText}}</p>
      
 
      </v-card>
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
  name: "Results",
  components: {},
  props: ['resultTitle','resultText'],
  data: () => ({
  
    answerText: ""
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),    
  },
  watch: {

  },
  methods: {  

  },
};
</script>
<style lang="scss" scoped>

 @import "@/assets/custom.scss";

.result-card {
  color: $social-game-party-orange !important;
  border-color: $social-game-party-orange !important;
  padding: 5px;
}

</style>
