<template>
  <div class="experimental">    
    
    <h1>This is the experimental page.</h1>

    <v-btn @click="pushMeTest">Push Me</v-btn>

  </div>
</template>


<script>

import * as sgf from "@/logic/socialGameFramework.js";
// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "Experimental",
  components: {
    
  },
  data: () => ({    
  }),
   mounted: function() {    
  },
  computed: {    
  },
  watch: {    
  },
  methods: {
    pushMeTest: function(){

      alert("The frameworks name is: " + sgf.mainFramework.name);
      var x =2;
      var y=3;
      alert(`${x} + ${y} = ${sgf.mainFramework.addStuff(x,y)} `);
    }
  },
};
</script>
<style lang="scss" scoped>

.experimental {
  text-align: center;
}

</style>
