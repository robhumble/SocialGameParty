import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export default class DataConnector {

  //Global--------------------------------------------------

  #firebaseSettings = {
    apiKey: "AIzaSyB9tDIaiwwE35jKUMOPvqmNsR4T1ZkHOcA",
    authDomain: "socialgameparty.firebaseapp.com",
    projectId: "socialgameparty"
  };

  firestoreDb = {};

  constructor() {
    this.initializeFireStoreDb();
  }  

  /**
  * Connect to the FireStore DB and listen to the chat room.
  */
  initializeFireStoreDb = function () {

    // Initialize Cloud Firestore through Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(this.#firebaseSettings);
    }

    //create db object
    this.firestoreDb = firebase.firestore();
  };

  //Chat Section--------------------------------
  
  chatRoomInfo = {
    chatRoomCollection: "chatRooms",
    chatRoomDoc: "globalChatRoom"
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


  // Firebase functions for room movement. -----------------------------

  // presently, make room does not check if the room already exists.
  // join room will fail if the room doesn't exist, but this is not reflected on the site
  // User IDs now correctly appear in rooms on the database and are deleted when the user leaves by any of the given buttons.
  // User IDs are not deleted by any other method of leaving the room. 
  makeRoom = function (makeRoomName, sessionID, clientInRoom) {
    // This line creates both the room and the document inside that will hold the array of users.
    this.firestoreDb.doc(`rooms/${makeRoomName}`).set({
      users: [sessionID]
    })
    /*.then(success => {
      console.log("Room created. " + success);
    })
    .catch(err => {
      console.error("Error: " + err);
    })*/
    if (clientInRoom) { //remove the user from the room they are in when they move, if they are in a room
      let roomDocRef = this.firestoreDb.doc(`rooms/${clientInRoom}`);

      this.firestoreDb.runTransaction(function (transaction) {
        return transaction.get(roomDocRef).then(function (roomDoc) {
          let u = roomDoc.data().users;
          u.sort(function (a, b) { return a - b });
          u.splice(u.findIndex((userID) => {
            return userID == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: u });
        })
      })/*.then(function() {
          console.log("exit room success");
        }).catch(function(err) {
          console.log("exit room failed" + err);
        });*/
    }

  }
  joinRoom = function (joinRoomName, sessionID, clientInRoom) {
    let joinRef = "";

    joinRef = this.firestoreDb.doc(`rooms/${joinRoomName}`);

    // Add the user's ID to the list of users in the room
    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(joinRef).then(function (joinDoc) {
        let u = joinDoc.data().users;
        u.push(sessionID);
        transaction.update(joinRef, { users: u });
      })
    })/*.then(function() {
        console.log("join room success");
      }).catch(function(err) {
        console.log("join room failed" + err);
      }); */

    if (clientInRoom) { //remove the user from the room they are in when they move, if they are in a room
      let roomDocRef = this.firestoreDb.doc(`rooms/${clientInRoom}`);

      this.firestoreDb.runTransaction(function (transaction) {
        return transaction.get(roomDocRef).then(function (roomDoc) {
          let u = roomDoc.data().users;
          u.sort(function (a, b) { return a - b });
          u.splice(u.findIndex((userID) => {
            return userID == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: u });
        })
      })/*.then(function() {
        console.log("exit room success");
      }).catch(function(err) {
        console.log("exit room failed" + err);
      });*/
    }
    return true;

  }
  exitRoom = function (sessionID, clientInRoom) {
    if (clientInRoom) { //remove the user from the room they are in when they move, if they are in a room
      let roomDocRef = this.firestoreDb.doc(`rooms/${clientInRoom}`);

      this.firestoreDb.runTransaction(function (transaction) {
        return transaction.get(roomDocRef).then(function (roomDoc) {
          let u = roomDoc.data().users;
          u.sort(function (a, b) { return a - b });
          u.splice(u.findIndex((userID) => {
            return userID == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: u });
        })
      })/*.then(function() {
        console.log("exit room success");
      }).catch(function(err) {
        console.log("exit room failed" + err);
      });*/
    }
  }



}