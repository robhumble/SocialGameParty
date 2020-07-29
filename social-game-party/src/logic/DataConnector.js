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
  * Connect to the FireStore DB and initialize the FireStore Db object.
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
      users: `{"${sessionID}":""}`
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
          let uobj = roomDoc.data().users
          uobj.sort(function (a, b) { return Object.keys(a) - Object.keys(b) }); 
          uobj.splice(uobj.findIndex((u) => {
            return Object.keys(u) == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: uobj });
        })
      })/*.then(function() {
        console.log("exit room success");
      }).catch(function(err) {
        console.log("exit room failed" + err);
      });*/
    }

  }
  // PLEASE remember these commands are caps sensitive in firebase.
  joinRoom = function (joinRoomName, sessionID, clientInRoom) {
    let joinRef = this.firestoreDb.doc(`rooms/${joinRoomName}`);

    // Add the user's ID to the list of users in the room
    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(joinRef).then(function (joinDoc) {
        let u = joinDoc.data().users;
        u.push( JSON.parse(`{"${sessionID}":""}`) );
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
          let uobj = roomDoc.data().users
          uobj.sort(function (a, b) { return Object.keys(a) - Object.keys(b) }); 
          uobj.splice(uobj.findIndex((u) => {
            return Object.keys(u) == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: uobj });
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
          let uobj = roomDoc.data().users
          uobj.sort(function (a, b) { return Object.keys(a) - Object.keys(b) }); 
          uobj.splice(uobj.findIndex((u) => {
            return Object.keys(u) == sessionID;
          }), 1);
          transaction.update(roomDocRef, { users: uobj });
        })
      })/*.then(function() {
        console.log("exit room success");
      }).catch(function(err) {
        console.log("exit room failed" + err);
      });*/
    }
  }

  // firebase code for joining and exiting the game inside the game room
  joinGame = function (sessionID, clientIsPlayer, clientInRoom) {
    //console.log (sessionID + clientIsPlayer + clientInRoom);
    let userObject = JSON.parse(`{"${sessionID}":"${clientIsPlayer}"}`);
    let roomDocRef = this.firestoreDb.doc(`rooms/${clientInRoom}`);

    // this only worked because i started with a set that was only the first bits.
    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {
        let uobj = roomDoc.data().users
        uobj.sort(function (a, b) { return Object.keys(a) - Object.keys(b) }); 
        uobj.splice(uobj.findIndex((u) => {
          return Object.keys(u) == sessionID;
        }), 1, userObject);
        transaction.update(roomDocRef, { users: uobj });
      })
    })/*.then(function() {
      console.log("game join success");
    }).catch(function(err) {
      console.log("game join failed" + err);
    });*/


  }
  exitGame = function (sessionID, clientInRoom) {
    console.log (sessionID + clientInRoom);
    let userObject = JSON.parse(`{"${sessionID}":""}`);
    let roomDocRef = this.firestoreDb.doc(`rooms/${clientInRoom}`);

    // joingame and exitgame contain an identical transaction block, the only change is the construction of the user object
    // there is potential here for this block to be extracted to its own callable function, something like "updateUser"
    // since it just finds the matching sessionID and wholesale swaps out the user object.
    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {
        let uobj = roomDoc.data().users
        uobj.sort(function (a, b) { return Object.keys(a) - Object.keys(b) }); 
        uobj.splice(uobj.findIndex((u) => {
          return Object.keys(u) == sessionID;
        }), 1, userObject);
        transaction.update(roomDocRef, { users: uobj });
      })
    })/*.then(function() {
      console.log("game exit success");
    }).catch(function(err) {
      console.log("game exit failed" + err);
    });*/

  }
  // Listen to the users list to display active players in the game room
  listenToUsers = function (onSnapshotFunction, clientInRoom) {

    //While this should be a listener, I am concerned changes that aren't the userlist will be sent. 
    this.firestoreDb
      .collection("rooms")
      .doc(clientInRoom)
      .onSnapshot(function (doc) {
        let remoteUserList = doc.data().users;
        onSnapshotFunction(remoteUserList);
      });
  };



}