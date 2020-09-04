<template>
  <v-container class="chat-container">
    <span class="in-room-text">You are in {{ currentRoomName || "GLOBAL" }} Chat</span>
    <v-text-field
      v-if="isGlobal"
      label="Display Name"
      placeholder="Your Name here..."
      v-model="providedDisplayName"
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
  </v-container>
</template>


<script>
import * as sgf from "@/logic/socialGameFramework.js";
import ChatDataConnector from "@/dataConnectors/ChatDataConnector.js";
import { mapGetters } from "vuex";

export default {
  name: "ChatRoom",

  data: () => ({
    providedDisplayName: "",    
    chatText: "",
    submitText: "",
    adminClearMsg: "!!! Admin has cleared the chat history !!!",

    //Data connection vars------------
    dataConnector: new ChatDataConnector(),
  }),
  props: ["isGlobal"],
  mounted: function () {
    this.setupChatRoom(this.currentRoomName);

    this.read;
  },
  computed: {
    ...mapGetters(["currentSession", "currentRoomName", "currentUserName"]),

    /**
     * Determine if the user is an Admin based on the provided display name.
     */
    isAdmin: function () {
      if (this.providedDisplayName.toLowerCase() == "admin") return true;

      return false;
    },

    displayUserName: function () {
      let un = "";

      if (this.isGlobal) un = this.providedDisplayName;
      else un = this.currentUserName;

      return un;
    },
  },
  watch: {
    //... n = new, o = old
    currentRoomName: function (n, o) {
      if (n != o) {
        this.dataConnector.unsubscribeToChat(o);
        this.setupChatRoom(n);
      }
    },
  },

  methods: {
    /**
     * Connect to the DB and listen to the chat room.
     */
    setupChatRoom: function (roomName) {
      var that = this;

      this.dataConnector.listenToChatRoom(roomName, function (remoteChatText) {
        that.chatText = remoteChatText;
        console.log("There was an update: " + remoteChatText);

        //scroll to bottom
        that.$nextTick(function () {
          sgf.mainFramework.scrollToBottom("mainChat");
        });
      });
    },

    /**
     * Add the contents of the submit textArea to the DB.
     */
    submit: function () {
      let updateText = `${this.displayUserName}: ${this.submitText} \n`;
      let newChatText = "";

      if (this.chatText == this.adminClearMsg) newChatText = updateText;
      else newChatText = this.chatText + updateText;

      this.dataConnector.updateChatRoomText(this.currentRoomName, newChatText);

      this.submitText = "";
    },

    /**
     * Clear the mainChat textArea.  (Should only be available to the Admin)
     */
    clearChat: function () {
      this.dataConnector.updateChatRoomText(
        this.currentRoomName,
        this.adminClearMsg
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.in-room-text {
  color: red;
  font-weight: bold;
}

.chat-container {
  background-color: white;
  padding: 5px;
  margin-top: 10px;
}
</style>