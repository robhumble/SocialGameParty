import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export default class DataConnector {

  #firebaseSettings = {
    apiKey: "AIzaSyB9tDIaiwwE35jKUMOPvqmNsR4T1ZkHOcA",
    authDomain: "socialgameparty.firebaseapp.com",
    projectId: "socialgameparty"
  };

  firestoreDb = {};

  chatRoomInfo = {
    chatRoomCollection: "rooms",
    chatRoomDoc: "VjfeioUKWHqyApwbU7X2"
  };

  constructor() {
  }

  //Firebase functions for chat--------------------------------

  /**
  * Connect to the FireStore DB and listen to the chat room.
  */
  setupDataConnectorForChatRoom = function () {

    // Initialize Cloud Firestore through Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(this.#firebaseSettings);
    }

    //create db object
    this.firestoreDb = firebase.firestore();
  };

  /**
   * Set the firestoreDb to monitor the chat room document for updates.
   * 
   * @param onSnapshotFunction function to run if the document we listen to is updated, this function expects the new chatText as a param.
   */
  listenToChatRoomPOC = function (onSnapshotFunction) {

    //subscribe/listen to room test doc
    this.firestoreDb
      .collection(this.chatRoomInfo.chatRoomCollection)
      .doc(this.chatRoomInfo.chatRoomDoc)
      .onSnapshot(function (doc) {
        let remoteChatText = doc.data().chatText;
        onSnapshotFunction(remoteChatText);
      });
  };

  /**
  * Set the chat room text in FireStore DB.
  * 
  * @param newChatText set chatText in the FireStore Db to this.
  */
  updateChatRoomText = function (newChatText) {

    this.firestoreDb
      .collection(this.chatRoomInfo.chatRoomCollection)
      .doc(this.chatRoomInfo.chatRoomDoc)
      .set({
        chatText: newChatText
      })
      .then(success => {
        console.log("Write Successful! :" + success);
      })
      .catch(err => {
        console.error("There was a db write error:", err);
      });
  };


}