<template>
  <v-container class="chat-container">
    <span class="in-room-text">You are in the ChatRoom.</span>
    <v-text-field
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
import DataConnector from "@/logic/DataConnector.js";
import { mapGetters } from "vuex";

export default {
  name: "ChatRoom",

  data: () => ({
    providedDisplayName: "",
    //displayUserName: "",
    chatText: "",
    submitText: "",
    adminClearMsg: "!!! Admin has cleared the chat history !!!",

    //Data connection vars------------
    dataConnector: new DataConnector(),
  }),
  mounted: function () {
    this.setupChatRoom(this.sessionRoomName);

    this.read;
  },
  computed: {
    ...mapGetters(["currentSession"]),

    /**
     * Determine if the user is an Admin based on the provided display name.
     */
    isAdmin: function () {
      if (this.providedDisplayName.toLowerCase() == "admin") return true;

      return false;
    },

    sessionRoomName: function () {
      return this.currentSession?.currentRoom?.name;
    },
    sessionDisplayName: function () {
      return this.currentSession?.currentUser?.name;
    },
    isGlobal: function () {
      return this.roomName && this.roomName != "";
    },

    displayUserName: function () {
      let un = "";

      if (this.providedDisplayName && this.sessionDisplayName)
        un = `(${this.sessionDisplayName}) ${this.providedDisplayName} `;
      else if(this.sessionDisplayName)  
        un = this.sessionDisplayName;
      else 
        un = this.providedDisplayName;

      return un;
    },
  },
  watch: {
    //... n = new, o = old
    sessionRoomName: function (n, o) {
      if (n != o) {
        this.setupChatRoom(n);
      }
    },
    sessionDisplayName: function (n, o) {
      if (n != o) {
        this.displayUserName = n;
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

      this.dataConnector.updateChatRoomText(this.sessionRoomName, newChatText);

      this.submitText = "";
    },

    /**
     * Clear the mainChat textArea.  (Should only be available to the Admin)
     */
    clearChat: function () {
      this.dataConnector.updateChatRoomText(this.sessionRoomName,this.adminClearMsg);
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