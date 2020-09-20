import DataConnector from "@/dataConnectors/DataConnector";
//import { SessionUser } from "@/logic/SessionInfo.js";


/**
 * DataConnector for interacting with "GamePlay"  (*BUT right now it only deals with "Rooms".... so it's really just kind of an extension of the data connector.)
 */
export default class GameplayDataConnector extends DataConnector {


  //TODO: figure out if this actually helps....
  #firestoreArtificialWaitWindowMS = 0;

  constructor() {
    super();
  }

  // Firebase functions for Game Play. -----------------------------

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
   * Update spectatorGameData.
   * @param {string} roomName 
   * @param {object} newSpecatorGameData 
   */
  updateSpectatorGameData = function (roomName, newSpecatorGameData) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { spectatorGameData: newSpecatorGameData });
      })
    })
  }

  //Player game Data functions-----------------------------------------------------------------------------------------------

  /**
   * Set the whole playerGameData object. (ignore prior state)
   * @param {string} roomName 
   * @param {object} newPlayerGameData 
   */
  setPlayerGameData = function (roomName, newPlayerGameData) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { playerGameData: newPlayerGameData });
      })
    })
  }

  /**
   * Set a property in playerGameData, the rest of the object should remain as it was in firestore. 
   * @param {string} roomName 
   * @param {string} propName 
   * @param {object} propVal 
   */
  updatePlayerGameData = function (roomName, propName, propVal) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {


        let newPlayerGameData = roomDoc.data().playerGameData;
        newPlayerGameData[propName] = propVal;

        transaction.update(roomDocRef, { playerGameData: newPlayerGameData });
      })
    })
  }


  /**
   * Clean a specified list of properties in playerGameData.
   * @param {string} roomName 
   * @param {Array} propNamesArr - Array of the names of each property we want to set to null.
   */
  cleanPlayerGameData = function (roomName, propNamesArr) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let newPlayerGameData = roomDoc.data().playerGameData;

        propNamesArr.forEach(name => {
          newPlayerGameData[name] = null;
        });

        transaction.update(roomDocRef, { playerGameData: newPlayerGameData });
      })
    })
  }

  /**
   * Pass in a function to update playerGameData.
   * @param {string} roomName 
   * @param {function name(playerGameData) { }} updateFunc - takes current playerGameData object from db and mutates it.
   */
  updatePlayerGameDataViaFunction = function (roomName, updateFunc) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let curPlayerGameData = roomDoc.data().playerGameData;
        let updatedPlayerGameData = updateFunc(curPlayerGameData);

        transaction.update(roomDocRef, { playerGameData: updatedPlayerGameData });
      })
    })
  }


  //currentInstructions Data functions-----------------------------------------------------------------------------------------------

  /**
   * Set the currentInstructions.  (ignore prior state)
   * @param {string} roomName 
   * @param {object} newInstructions 
   */
  setCurrentInstructions = function (roomName, newInstructions) {
    //let that = this;
    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { currentInstructions: newInstructions });
      })
    })
  }

  /**
   * Pass in a function to update currentInstructions.
   * @param {string} roomName 
   * @param {function} updateFunc - function takes the current currentInstructions as an arg
   */
  updateCurrentInstructionsViaFunction = function (roomName, updateFunc) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let curCurrentInstructions = roomDoc.data().currentInstructions;
        let updatedCurrentInstructions = updateFunc(curCurrentInstructions);

        transaction.update(roomDocRef, { currentInstructions: updatedCurrentInstructions });
      })
    })
  }


  //currentCheckInstructions game Data functions-----------------------------------------------------------------------------------------------

  /**
   * Set the currentCheckInstructions.  (ignore prior state)
   * @param {string} roomName 
   * @param {object} newCheckInstructions 
   */
  setCurrentCheckInstructions = function (roomName, newCheckInstructions) {
    //let that = this;
    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { currentCheckInstructions: newCheckInstructions });
      })
    })
  }

  /**
   * Pass in a function to update currentCheckInstructions.
   * @param {string} roomName 
   * @param {function} updateFunc - function takes the current currentCheckInstructions as an arg
   */
  updateCurrentCheckInstructionsViaFunction = function (roomName, updateFunc) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let curCurrentCheckInstructions = roomDoc.data().currentCheckInstructions;
        let updatedCurrentCheckInstructions = updateFunc(curCurrentCheckInstructions);

        transaction.update(roomDocRef, { currentCheckInstructions: updatedCurrentCheckInstructions });
      })
    })
  }

  //Whole Room Update (when you need to reach across multiple properties)--------------------------------------------------------

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
  gameplayAddToBatch(batch, operation, roomName, dataToUpdate) {
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
  resetGameData = function (roomName) {
    this.updateWholeRoomViaFunction(roomName, (roomData) => {
      roomData.playerGameData = {};
      roomData.spectatorGameData = {};
      roomData.currentCheckInstructions = null;
      roomData.currentInstructions = null;
      roomData.hostId = null

      return roomData;
    });
  }




  //TODO: The document is already being listened to because the data is part of the users room, unless this is extracted into a separate document we can probably get rid of this.

  //Stores the unsubscribe function generated by firestore when we setup a listener. 
  /*
  unsubscribeToPlayerGameDataFunc = null;

  listenToPlayerGameData = function (onSnapshotFunction, roomName) {

    //Don't subscribe to multiple rooms
    if (this.unsubscribeToPlayerGameDataFunc)
      this.unsubscribeToPlayerGameData();

    //While this should be a listener, I am concerned changes that aren't the userlist will be sent. 
    this.unsubscribeToPlayerGameDataFunc = this.firestoreDb
      .collection("rooms")
      .doc(roomName)
      .onSnapshot(function (doc) {
        let remotePlayerGameData = doc.data().playerGameData;
        onSnapshotFunction(remotePlayerGameData);
      });
  }

  unsubscribeToPlayerGameData = function () {
    if (this.unsubscribeToPlayerGameDataFunc) {
      this.unsubscribeToPlayerGameDataFunc();
      console.log("Unsubscribed to room!");
      this.unsubscribeToPlayerGameDataFunc = null;
    }
    else
      console.log("Nothing to unsubscribe from!");
  }
  */


}