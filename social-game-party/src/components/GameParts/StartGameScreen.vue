<template>
   <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="start-game-card ">
        <v-card-title class="text-center">Start Game?</v-card-title>

        <h1>{{titleText}}</h1>
        <p>{{bodyText}}</p>

        <v-btn @click="startTheGame"> START!!!!!!!! </v-btn>      
 
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
  props: ['titleText','bodyText'],
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
    startTheGame: function(){
      alert("You started the game!");

      this.$emit("startGame");
      console.log("Game starting....");
    }
  },
};
</script>
<style lang="scss" scoped>

 @import "@/assets/custom.scss";

.start-game-card {
  color: $social-game-party-orange !important;
  border-color: $social-game-party-orange !important;
  padding: 5px;
}

</style>
