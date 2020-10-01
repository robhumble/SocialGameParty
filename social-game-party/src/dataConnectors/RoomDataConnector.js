import DataConnector from "@/dataConnectors/DataConnector";
import { SessionUser } from "@/logic/SessionInfo.js";
import * as sgf from "@/logic/socialGameFramework.js";

/**
 * DataConnector for interacting with "Rooms".
 */
export default class RoomDataConnector extends DataConnector {

  constructor() {
    super();
  }

  // Firebase functions for room movement. -----------------------------

  /**
   * Create a new Room and automatically join it as a specatator.
   * @param {string} newRoomName 
   * @param {SessionUser} userObj 
   */
  makeRoom = async function (newRoomName, sessionUserObj) {

    let userObj = this.buildDbModelFromSessionUser(sessionUserObj);

    let userArr = [userObj];

    let roomDbModel = this.builRoomDbModel(userArr)

    var existingDoc = await this.firestoreDb.collection("rooms").doc(newRoomName).get();

    if (existingDoc.data())
      throw Error("Document already exists!");

    // This line creates both the room and the document inside that will hold the array of users.
    this.firestoreDb.doc(`rooms/${newRoomName}`).set(roomDbModel);

    // //Create the game resources here too?
    this.firestoreDb.doc(`activePlayerGameData/${newRoomName}`).set({});
    this.firestoreDb.doc(`hostGameData/${newRoomName}`).set({});      
    


  };

  // PLEASE remember these commands are caps sensitive in firebase.
  /**
   * Join the target room if found.
   * @param {string} joinRoomName 
   * @param {SessionUser} userObj 
   * @param {function} updateRoomFunction - runs after transaction to update the UI.
   * @param {boolean} alertUser - true alerts the user if the room wasn't found, false suppresses the alert.
   */
  joinRoom = function (joinRoomName, sessionUserObj, updateRoomFunction, alertUser = true) {
    let userObj = this.buildDbModelFromSessionUser(sessionUserObj);

    var that = this;
    let joinRef = this.firestoreDb.doc(`rooms/${joinRoomName}`);

    // Add the user's ID to the list of users in the room
    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(joinRef).then(function (joinDoc) {

        let docData = joinDoc.data();

        if (docData) {
          let allUsers = docData.users;
          if (allUsers.some(x => x.id == userObj.id))
            //if the db already thinks the user is in the room - just kick them out of play
            allUsers.forEach(usr => that.updateUserPlayingStatus(usr, userObj.id, false));
          else
            //if not found in the room, add them to the room
            allUsers.push(userObj);

          transaction.update(joinRef, { users: allUsers });
          updateRoomFunction(joinRoomName);

        }
        else {
          if (alertUser)
            alert("The Room you tried to join doesn't exist, try again or make a new room.");

          //The room doesn't exist, run the fail function
          updateRoomFunction("");
        }

      })
    })
  }

  /**
   * Exit the current room.
   * @param {number} userId - users unique id 
   * @param {string} roomName 
   */
  exitRoom = function (userId, roomName) {
    // var that = this;

    if (roomName) { //remove the user from the room they are in when they move, if they are in a room
      let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);
      let chatRoomDocRef = this.firestoreDb.doc(`chatRooms/${roomName}`);
      let apgdDocRef = this.firestoreDb.doc(`activePlayerGameData/${roomName}`);
      let hostDocRef = this.firestoreDb.doc(`hostGameData/${roomName}`);      
      

      this.firestoreDb.runTransaction(function (transaction) {
        return transaction.get(roomDocRef).then(function (roomDoc) {
          let allUsers = roomDoc.data().users;

          let updatedUsers = allUsers.filter(x => x.id != userId);

          //Last one out closes down the room
          if (updatedUsers.length < 1) {
            transaction.delete(roomDocRef);
            //close down the other associated collections as well.         
            transaction.delete(chatRoomDocRef);
            transaction.delete(apgdDocRef);
            transaction.delete(hostDocRef);
          }
          else
            transaction.update(roomDocRef, { users: updatedUsers });
        })
      })

    }

    //If we were listening to a room, unsubscribe from it.
    if (this.unsubscribeToRoomFunc)
      this.unsubscribeToRoom();

  }

  // firebase code for joining and exiting the game inside the game room
  /**
   * 
   * @param {number} userId - user's unique id 
   * @param {string} roomName 
   */
  joinGame = function (userId, roomName) {

    let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let allUsers = roomDoc.data().users;
        allUsers.forEach(user => that.updateUserPlayingStatus(user, userId, true));
        transaction.update(roomDocRef, { users: allUsers });

      })
    })

  }

  /**
   * Exit the current game.
   * @param {number} userId - user's unique id
   * @param {string} roomName 
   */
  exitGame = function (userId, roomName) {
    let that = this;
    sgf.mainFramework.megaLog(userId + roomName);

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let allUsers = roomDoc.data().users
        allUsers.forEach(user => that.updateUserPlayingStatus(user, userId, false));
        transaction.update(roomDocRef, { users: allUsers });

      })
    })
  }

  //Stores the unsubscribe function generated by firestore when we setup a listener.
  unsubscribeToRoomFunc = null;

  /**
   * Listen to the target room's user list.
   * @param {function} onSnapshotFunction - function runs after the user list is retrieved.
   * @param {string} roomName 
   */
  listenToRoom = function (onSnapshotFunction, roomName) {

    //Don't subscribe to multiple rooms
    if (this.unsubscribeToRoomFunc)
      this.unsubscribeToRoom();

    //While this should be a listener, I am concerned changes that aren't the userlist will be sent. 
    this.unsubscribeToRoomFunc = this.firestoreDb
      .collection("rooms")
      .doc(roomName)
      .onSnapshot(function (doc) {

        let docData = doc.data();

        if (docData) {
          let remoteRoomData = {
            users: docData.users,
            hostId: docData.hostId,
            spectatorGameData: docData.spectatorGameData,
            playerGameData: docData.playerGameData,

            currentInstructions: docData.currentInstructions,
            currentCheckInstructions: docData.currentCheckInstructions,
          }
          onSnapshotFunction(remoteRoomData);
        }
      });
  };

  unsubscribeToRoom = function () {
    if (this.unsubscribeToRoomFunc) {
      this.unsubscribeToRoomFunc();
      sgf.mainFramework.megaLog("Unsubscribed to room!");
      this.unsubscribeToRoomFunc = null;
    }
    else
      sgf.mainFramework.megaLog("Nothing to unsubscribe from!");
  }

  /**
   * Attempt to join the room, but don't alert the user if it can't be found.
   * @param {string} joinRoomName 
   * @param {SessionUser} sessionUserObj 
   * @param {function} updateRoomFunction - runs after transaction to update the UI.
   */
  rejoinRoom = function (joinRoomName, sessionUserObj, updateRoomFunction) {
    this.joinRoom(joinRoomName, sessionUserObj, updateRoomFunction, false);
  }



  //TODO: TEST BEFORE USING - This is untested...
  /**
   * Delete the specified room from the rooms collection.
   * @param {string} roomName 
   */
  deleteRoom = function (roomName) {

    this.firestoreDb.collection("rooms").doc(roomName).delete()
      .then(
        sgf.mainFramework.megaLog(`Room "${roomName}" has been deleted. `)
      ).catch(err => {
        sgf.mainFramework.megaLog("There was an issue deleting the room: " + err);
      });

  }


//Migrated from GamePlayDataConnector -------------------------------------->




 /**
   * Update the host for the current game.  
   * @param {number} newHostId - the unique user id of the new host - likely the current user 
   * @param {string} roomName 
   */
  updateHost = function (newHostId, roomName) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { hostId: newHostId });
      })
    })
  }



 /**
   * Update the room by passing in a function.
   * @param {string} roomName 
   * @param {function} updateFunc - function takes the current room data as an arg
   */
  updateWholeRoomViaFunction = function (roomName, updateFunc) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let curRoomData = roomDoc.data();
        let updatedRoomData = updateFunc(curRoomData);

        transaction.update(roomDocRef, updatedRoomData);
      })
    })
  }


   /**
   * Quick version of the base dataConnector batch funcitons that specifically targets the room collection
   * @param {object} batch 
   * @param {string} operation 
   * @param {string} roomName 
   * @param {object} dataToUpdate 
   */
   roomAddToBatch(batch, operation, roomName, dataToUpdate) {
    let ref = this.firestoreDb.collection("rooms").doc(roomName);

    switch (operation) {
      case "set": batch.set(ref, dataToUpdate); break;
      case "update": batch.update(ref, dataToUpdate); break;
      case "delete": batch.delete(ref); break;
    }

    return batch;
  }


   /**
   * Clear the game related data in the room document.
   * @param {string} roomName 
   */
  resetRoomGameData = function (roomName) {
    this.updateWholeRoomViaFunction(roomName, (docData) => {
      //docData.playerGameData = {};
      docData.spectatorGameData = {};
      //docData.currentCheckInstructions = null;
      //docData.currentInstructions = null;
      docData.hostId = null

      return docData;
    });
  }







  //Private Helpers-------------------------------------->

  /**
   * Set's whether or not a user is playing the game.
   * @param {dbUserObj} userObj - Assume this is a user object from the db.
   * @param {number} targetId 
   * @param {boolean} isPlayingStatus 
   */
  updateUserPlayingStatus = function (userObj, targetId, isPlayingStatus) {

    if (userObj.id == targetId)
      userObj.isPlaying = isPlayingStatus;
  }

  //TODO: Consider creating a class that represents the DBUSER instead of just creating the same type of object with this function.
  /**
   * Get a db representation of a SessionUser
   * @param {SessionUser} sessionUserObj - likely the current user.
   */
  buildDbModelFromSessionUser = function (sessionUserObj) {

    if (sessionUserObj instanceof SessionUser) {

      let userDbModel = {
        id: sessionUserObj.uniqueId,
        name: sessionUserObj.name,
        isPlaying: false,
      };

      return userDbModel;
    }
    else
      throw new Error('A SessionUser object was not provided!');

  }

  //TODO: Probably need to turn this into a class as well
  builRoomDbModel = function (userArr) {
    let dbModel = {
      users: userArr, //Users in the room      
      hostId: null,   //The games host user - basically a player that will act as the server

      //Game specific dynamically generated data
      spectatorGameData: {},  //Dynamically generated data that spectators (and anyone in the room) cares about
      //playerGameData: {},  //Dynamically generated data that only active players care about (probably private, and also only stuff that is relevant to other active players)

      //NEW - Game Instructions
      //currentInstructions: null,  //Instructions on what the player should be seeing/doing - this may be "show a loading screen" OR "Loop through questions and answer them"
      //currentCheckInstructions: null,  //Instructions for the host to check for a certain scenario and then do a specified action 
    }

    return dbModel;
  }

}