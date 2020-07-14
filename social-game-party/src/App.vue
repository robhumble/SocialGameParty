<template>
  <v-app>
    <!-- ===== Nav Bar ===== -->
    <v-app-bar app color="deep-orange accent-4" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/Puzzle_OrangeFace.png')"
          transition="scale-transition"
          width="40"
        />
        <h1 class="d-none d-lg-flex">Social Game Party Thing!</h1>
        <h1 class="d-lg-none">SGPT!</h1>
      </div>

      <v-spacer></v-spacer>

      <h2>ChittyChatty POC</h2>
    </v-app-bar>

    <v-content>
      <!-- ===== Router views/components injected here ===== -->
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {}
};
</script>
