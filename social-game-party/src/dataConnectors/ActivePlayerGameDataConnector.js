import DataConnector from "@/dataConnectors/DataConnector";
//import { SessionUser } from "@/logic/SessionInfo.js";
import * as sgf from "@/logic/socialGameFramework.js";


/**
 * Data connector for Game Data that all players need to listen to.
 */
export default class ActivePlayerGameDataConnector extends DataConnector {

  constructor() {
    super();
  }

  #connectorCollectionName = "activePlayerGameData";


  //General Functions--------------------------------------------


  makeActivePlayerGameData = async function (roomName) {

    let activeDataDbModel = this.buildActivePlayerGameDataDbModel();

    var existingDoc = await this.firestoreDb.collection(this.#connectorCollectionName).doc(roomName).get();

    if (existingDoc.data())
      throw Error("Document already exists!");

    // This line creates both the document and the data inside of it
    this.firestoreDb.doc(`${this.#connectorCollectionName}/${roomName}`).set(activeDataDbModel);

  };




  //Stores the unsubscribe function generated by firestore when we setup a listener.
  unsubscribeToActivePlayerGameDataFunc = null;


  listenToActivePlayerGameData = function (onSnapshotFunction, roomName) {

    //Don't subscribe to multiple rooms
    if (this.unsubscribeToActivePlayerGameDataFunc)
      this.unsubscribeToActivePlayerGameData();

    //While this should be a listener, I am concerned changes that aren't the userlist will be sent. 
    this.unsubscribeToActivePlayerGameDataFunc = this.firestoreDb
      .collection(this.#connectorCollectionName)
      .doc(roomName)
      .onSnapshot(function (doc) {

        let docData = doc.data();

        if (docData) {
          let remoteActivePlayerGameData = {

            currentStep: docData.currentStep,

            currentInstructions: docData.currentInstructions,
            currentCheckInstructions: docData.currentCheckInstructions,
            currentTargetedInstructions: docData.currentTargetedInstructions,
            currentHudInstructions: docData.currentHudInstructions,
            currentAltViewInstructions: docData.currentAltViewInstructions,

            dynamicPlayerGameData: docData.dynamicPlayerGameData,

          }
          onSnapshotFunction(remoteActivePlayerGameData);
        }
      });
  };

  unsubscribeToActivePlayerGameData = function () {
    if (this.unsubscribeToActivePlayerGameDataFunc) {
      this.unsubscribeToActivePlayerGameDataFunc();
      sgf.mainFramework.megaLog("Unsubscribed to ActivePlayerGameData!");
      this.unsubscribeToActivePlayerGameDataFunc = null;
    }
    else
      sgf.mainFramework.megaLog("No ActivePlayerGameData to unsubscribe from!");
  }

  /**
   * Delete the specified ActivePlayerGameData from the ActivePlayerGameData collection.
   * @param {string} roomName 
   */
  deleteActivePlayerGameData = function (roomName) {

    this.firestoreDb.collection(this.#connectorCollectionName).doc(roomName).delete()
      .then(
        sgf.mainFramework.megaLog(`ActivePlayerGameData "${roomName}" has been deleted. `)
      ).catch(err => {
        sgf.mainFramework.megaLog("There was an issue deleting the ActivePlayerGameData: " + err);
      });

  }


  //Migrated from GamePlayDataConnector -------------------------------------->



  //UNSURE IF THIS IS NEEDED ANYMORE
  /**
    * Set the whole dynamicPlayerGameData object. (ignore prior state)
    * @param {string} roomName 
    * @param {object} newPlayerGameData 
    */
  setDynamicPlayerGameData = function (roomName, newPlayerGameData) {
    //let that = this;

    let roomDocRef = this.firestoreDb.doc(`${this.#connectorCollectionName}/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function () {
        transaction.update(roomDocRef, { dynamicPlayerGameData: newPlayerGameData });
      })
    })
  }

  //UNSURE IF THIS IS NEEDED ANYMORE
  /**
   * Set a property in playerGameData, the rest of the object should remain as it was in firestore. 
   * @param {string} roomName 
   * @param {string} propName 
   * @param {object} propVal 
   */
  updatePlayerGameData = function (roomName, propName, propVal) {
    //let that = this;

    let docRef = this.firestoreDb.doc(`${this.#connectorCollectionName}/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(docRef).then(function (currentDoc) {


        let newPlayerGameData = currentDoc.data().dynamicPlayerGameData;
        newPlayerGameData[propName] = propVal;

        transaction.update(docRef, { dynamicPlayerGameData: newPlayerGameData });
      })
    })
  }




  /**
    * Update the ActivePlayerGameData by passing in a function.
    * @param {string} roomName 
    * @param {function} updateFunc - function takes the current ActivePlayerGameData data as an arg
    */
  updateWholeActivePlayerGameDataViaFunction = function (roomName, updateFunc) {
    //let that = this;

    let docRef = this.firestoreDb.doc(`${this.#connectorCollectionName}/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(docRef).then(function (targetDoc) {

        let curDocData = targetDoc.data();
        let updatedDocData = updateFunc(curDocData);

        //Only update if the doc data exists
        if (updatedDocData)
          transaction.update(docRef, updatedDocData);
      })
    })
  }


  /**
  * Quick version of the base dataConnector batch funcitons that specifically targets the ActivePlayerGameData collection
  * @param {object} batch 
  * @param {string} operation 
  * @param {string} roomName 
  * @param {object} dataToUpdate 
  */
  activePlayerGameDataAddToBatch(batch, operation, roomName, dataToUpdate) {
    let ref = this.firestoreDb.collection(this.#connectorCollectionName).doc(roomName);

    switch (operation) {
      case "set": batch.set(ref, dataToUpdate); break;
      case "update": batch.update(ref, dataToUpdate); break;
      case "delete": batch.delete(ref); break;
    }

    return batch;
  }


  /**
  * Clear the game related data in the ActivePlayerGameData document.
  * @param {string} roomName 
  */
  resetActivePlayerGameData = function (roomName) {
    this.updateWholeActivePlayerGameDataViaFunction(roomName, (docData) => {

      docData.currentStep = null;
      docData.dynamicPlayerGameData = {};
      //docData.spectatorGameData = {};
      docData.currentCheckInstructions = null;
      docData.currentInstructions = null;
      docData.currentTargetedInstructions = null;
      docData.currentHudInstructions = null;
      docData.currentAltViewInstructions = null;
      //docData.hostId = null

      return docData;
    });
  }


  //Private Helpers-------------------------------------->



  buildActivePlayerGameDataDbModel = function () {
    let dbModel = {

      currentStep: null,

      //Game Instructions
      currentInstructions: null,  //Instructions on what the player should be seeing/doing - this may be "show a loading screen" OR "Loop through questions and answer them"
      currentCheckInstructions: null,  //Instructions for the host to check for a certain scenario and then do a specified action
      currentTargetedInstructions: null,
      currentHudInstructions: null,
      currentAltViewInstructions: null,

      //Used to be game data - this is a general container for data that needs to be stored by the current game.
      dynamicPlayerGameData: {},  //Dynamically generated data that only active players care about (probably private, and also only stuff that is relevant to other active players)
    }

    return dbModel;
  }


}