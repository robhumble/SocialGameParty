<template>
  <v-container>
    <v-row class="text-center">
      <v-col />
      <v-col cols="12" sm="6" md="3">
        You are in the ChatRoom.
        <v-text-field
          label="Display Name"
          placeholder="Your Name here..."
          v-model="displayUserName"
        ></v-text-field>

        <v-textarea outlined name="main-chat" label="Main Chat" v-model="chatText" disabled></v-textarea>

        <div v-if="displayUserName != ''" class="submit-area" >

        <v-textarea
          name="submit-area"
          label="Submit Area"
          v-model="submitText"
          hint="Type stuff here..."
        ></v-textarea>

        <v-btn @click="submit">Submit</v-btn>
        
        </div>
      </v-col>

      <v-col />
    </v-row>
  </v-container>
</template>


<script>
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export default {
  name: "ChatRoom",

  data: () => ({
    displayUserName: "",
    chatText: "",
    submitText: "",

    //Firestore work
    firestoreDb: null
  }),
  mounted: function() {
    this.setupFirestore();

    this.read;
  },
  methods: {
    setupFirestore: function() {
      let that = this;

      // Initialize Cloud Firestore through Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyB9tDIaiwwE35jKUMOPvqmNsR4T1ZkHOcA",
          authDomain: "socialgameparty.firebaseapp.com",
          projectId: "socialgameparty"
        });
      }

      //create db object
      this.firestoreDb = firebase.firestore();

      //subscribe/listen to room test doc
      this.firestoreDb
        .collection("rooms")
        .doc("VjfeioUKWHqyApwbU7X2")
        .onSnapshot(function(doc) {
          let remoteChatText = doc.data().chatText;

          that.chatText = remoteChatText;
          console.log("There was an update: " + remoteChatText);
        });
    },

    //(Obsolete) original test - just updates local data
    simpleSubmit: function() {
      let updateText = `${this.displayUserName}:${this.submitText} \n`;
      this.chatText += updateText;
      this.submitText = "";
    },

    submit: function() {
      let updateText = `${this.displayUserName}:${this.submitText} \n`;
      let newChatText = this.chatText + updateText;

      this.firestoreDb
        .collection("rooms")
        .doc("VjfeioUKWHqyApwbU7X2")
        .set({
          chatText: newChatText
        })
        .then(success => {
          console.log("Write Successful! :" + success);
        })
        .catch(err => {
          console.error("There was a db write error:", err);
        });

      this.submitText = "";
    }
  }
};
</script>
