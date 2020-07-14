<template>
  <v-container>
    <v-row class="text-center">
      <v-col />
      <v-col cols="12" sm="6" md="3">
        <span class="in-room-text">You are in the ChatRoom.</span>
        <v-text-field
          label="Display Name"
          placeholder="Your Name here..."
          v-model="displayUserName"
        ></v-text-field>

        <v-textarea
          outlined
          id="mainChat"
          ref="mainChat"
          name="main-chat"
          label="Main Chat"
          v-model="chatText"
          readonly
        ></v-textarea>

        <div v-if="displayUserName != ''" class="submit-area">
          <v-textarea
            name="submit-area"
            label="Submit Area"
            v-model="submitText"
            hint="Type stuff here..."
            @keydown.enter="submit"
          ></v-textarea>

          <v-btn @click="submit">Submit</v-btn>

          <v-btn v-if="isAdmin" @click="clearChat">Clear History</v-btn>
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
    adminClearMsg: "!!! Admin has cleared the chat history !!!",

    //Firestore vars ---
    firestoreDb: null
  }),
  mounted: function() {
    this.setupFirestore();

    this.read;
  },
  computed: {
    /**
     * Determine if the user is an Admin based on the provided display name.
     */
    isAdmin: function() {
      if (this.displayUserName.toLowerCase() == "admin") return true;

      return false;
    }
  },
  watch: {},

  methods: {
    /**
     * Connect to the FireStore DB and listen to the chat room.
     */
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

          //scroll to bottom
          that.$nextTick(function() {
            that.mainChatScrollToBottom();
          });
        });
    },

    /**
     * Add the contents of the submit textArea FireStore DB.
     */
    submit: function() {
      let updateText = `${this.displayUserName}: ${this.submitText} \n`;
      let newChatText = "";

      if (this.chatText == this.adminClearMsg) newChatText = updateText;
      else newChatText = this.chatText + updateText;

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
    },

    /**
     * Clear the mainChat textArea.  (Should only be available to the Admin)
     */
    clearChat: function() {
      this.firestoreDb
        .collection("rooms")
        .doc("VjfeioUKWHqyApwbU7X2")
        .set({
          chatText: this.adminClearMsg
        })
        .then(success => {
          console.log("Write Successful! :" + success);
        })
        .catch(err => {
          console.error("There was a db write error:", err);
        });
    },

    /**
     * Scroll to the bottom of the mainChat textArea.
     */
    mainChatScrollToBottom: function() {
      var mainChat = document.getElementById("mainChat");
      mainChat.scrollTop = mainChat.scrollHeight;
    }
  }
};
</script>

<style lang="scss" scoped>
.in-room-text {
  color: red;
  font-weight: bold;
}
</style>