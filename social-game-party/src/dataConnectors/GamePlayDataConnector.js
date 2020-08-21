import DataConnector from "@/dataConnectors/DataConnector";
//import { SessionUser } from "@/logic/SessionInfo.js";


/**
 * DataConnector for interacting with "Rooms".
 */
export default class GamePlayDataConnector extends DataConnector {

  constructor() {
    super();
  }

  // Firebase functions for Game Play. -----------------------------


  //TODO - Test these, these were all just hacked together.........


  /**
   * Set the host.  
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

  updateSpectatorGameData = function (roomName, newSpecatorGameData) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { spectatorGameData: newSpecatorGameData });
      })
    })
  }

  updatePlayerGameData = function (roomName, newPlayerGameData) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { playerGameData: newPlayerGameData });
      })
    })
  }

  //TODO: This is meant to be for listening to the playerGameData IF a host is set, the game has started, and the current user is playing  

  //Stores the unsubscribe function generated by firestore when we setup a listener.
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


}