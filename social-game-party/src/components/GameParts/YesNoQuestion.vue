<template>
   <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="question-answer-card ">
        <v-card-title class="text-center">Question!</v-card-title>

        <h1>{{questionText}}</h1>

        <input class="basic-text-input" v-model="answerText" @keydown.enter="submitAnswer">

        <v-btn @click="submitAnswer(true)">Yes!</v-btn>
        <v-btn @click="submitAnswer(false)">No</v-btn>
 
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
  name: "YesNoQuestion",
  components: {},
  props: ['questionText'],
  data: () => ({ 
  }),
  mounted: function () {},
  computed: {
    ...mapGetters(["projectName", "currentSession"]),    
  },
  watch: {

  },
  methods: {

    submitAnswer: function(answerResult){
      //alert("This is the answer:"+this.answerText);      
      
      this.$emit("answerEvent", answerResult)   
    },

  },
};
</script>
<style lang="scss" scoped>

 @import "@/assets/custom.scss";

.question-answer-card {
  color: $social-game-party-orange !important;
  border-color: $social-game-party-orange !important;
  padding: 5px;
}

</style>
