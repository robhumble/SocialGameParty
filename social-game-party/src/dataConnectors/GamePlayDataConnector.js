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


  //TODO - Test these, these were all just hacked together.........

  slowItDown = function () {
    setTimeout(() => { console.log("slowed...."), this.#firestoreArtificialWaitWindowMS });
  }


  /**
   * Set the host.  
   * @param {number} newHostId - the unique user id of the new host - likely the current user 
   * @param {string} roomName 
   */
  updateHost = function (newHostId, roomName) {
    // this.slowItDown();
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { hostId: newHostId });
      })
    })
  }

  updateSpectatorGameData = function (roomName, newSpecatorGameData) {
    // this.slowItDown();
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { spectatorGameData: newSpecatorGameData });
      })
    })
  }

  //Player game Data functions-----------------------------------------------------------------------------------------------

  //Set the whole playerGameData object - ignore prior state
  setPlayerGameData = function (roomName, newPlayerGameData) {
    // this.slowItDown();
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { playerGameData: newPlayerGameData });
      })
    })
  }

  //Set a property in playerGameData, the rest of the object should remain as it was in firestore. 
  updatePlayerGameData = function (roomName, propName, propVal) {
    // this.slowItDown();
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


  cleanPlayerGameData = function (roomName, propNamesArr) {
    // this.slowItDown();
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

  updatePlayerGameDataViaFunction = function (roomName, updateFunc) {
    // this.slowItDown();
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

  setCurrentInstructions = function (roomName, newInstructions) {
    // this.slowItDown();
    //let that = this;
    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (/*roomDoc*/) {
        //let curInstructions = roomDoc.data().currentInstructions;           
        transaction.update(roomDocRef, { currentInstructions: newInstructions });
      })
    })
  }

  updateCurrentInstructionsViaFunction = function (roomName, updateFunc) {
    // this.slowItDown();
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

  setCurrentCheckInstructions = function (roomName, newCheckInstructions) {
    // this.slowItDown();
    //let that = this;
    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (/*roomDoc*/) {
        //let curCheckInstructions = roomDoc.data().currentCheckInstructions;           
        transaction.update(roomDocRef, { currentCheckInstructions: newCheckInstructions });
      })
    })
  }

  updateCurrentCheckInstructionsViaFunction = function (roomName, updateFunc) {
    // this.slowItDown();
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


  updateWholeRoomViaFunction = function (roomName, updateFunc) {
    // this.slowItDown();
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


  //Quick version of the base dataConnector batch funcitons that specifically targets the room collection
  gameplayAddToBatch(batch, operation, roomName, dataToUpdate) {
    let ref = this.firestoreDb.collection("rooms").doc(roomName);

    switch (operation) {
      case "set": batch.set(ref, dataToUpdate); break;
      case "update": batch.update(ref, dataToUpdate); break;
      case "delete": batch.delete(ref); break;
    }

    return batch;
  }


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