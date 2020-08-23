<template>
   <div style="text-align:center;">
    <div class="d-flex justify-center">
      <v-card max-width="80%" rounded outlined class="question-answer-card ">
        <v-card-title class="text-center">Question!</v-card-title>

        <h1>{{questionText}}</h1>

        <input v-model="answerText">

        <v-btn @click="submitAnswer">Submit</v-btn>
 
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
  name: "QuestionAndAnswer",
  components: {},
  props: ['questionText'],
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

    submitAnswer: function(){
      //alert("This is the answer:"+this.answerText);      
      
      this.$emit("answerEvent", this.answerText)
      this.answerText="";      
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
