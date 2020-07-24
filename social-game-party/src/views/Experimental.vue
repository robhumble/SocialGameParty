<template>
  <div class="experimental">
    <div>
      <h1>This is the experimental page.</h1>

      <v-btn @click="pushMeTest">Push Me</v-btn>
    </div>

    <br />

    <div style="text-align:center;" id="vuexTest">
      VUEX TESTING--------------------------------->
      <label style="display:block">Vuex projectName</label>
      <br />
      <span>{{projectName}}</span>

      <br />
      <input v-model="newName" placeholder="new name...." />
      <v-btn @click="updateProjectName">Update!</v-btn>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex";
import * as sgf from "@/logic/socialGameFramework.js";
// import DataConnector from "@/logic/DataConnector.js";

export default {
  name: "Experimental",
  components: {},
  data: () => ({
    newName: null
  }),
  mounted: function() {},
  computed: {
    ...mapGetters(["projectName"])
  },
  watch: {},
  methods: {
    pushMeTest: function() {
      alert("The frameworks name is: " + sgf.mainFramework.name);
      var x = 2;
      var y = 3;
      alert(`${x} + ${y} = ${sgf.mainFramework.addStuff(x, y)} `);
    },

    updateProjectName() {
      this.$store.commit("setProjectName", this.newName);
    }
  }
};
</script>
<style lang="scss" scoped>
.experimental {
  text-align: center;
}
</style>
