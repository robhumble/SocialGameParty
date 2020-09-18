import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import * as sgf from "@/logic/socialGameFramework.js";

/**
 * BASE DataConnector class - other DataConnector classes inherit from this.
 */
export default class DataConnector {

  #firebaseSettings = {
    apiKey: "AIzaSyB9tDIaiwwE35jKUMOPvqmNsR4T1ZkHOcA",
    authDomain: "socialgameparty.firebaseapp.com",
    projectId: "socialgameparty"
  };

  firestoreDb = {};

  constructor() {
    this.initializeFireStoreDb();
  }

  //General functions--------------------------------------------------

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

  //TODO - NOT yet used, test thoroughly before using
  /**
   * Update the specified document using the instruction defined in the passed in function.
   * @param {*} collectionName 
   * @param {*} documentName 
   * @param {*} updateFunc -  function takes the current document data as an arg
   */
  updateDocumentViaFunction = function (collectionName, documentName, updateFunc) {
    //let that = this;

    let documentRef = this.firestoreDb.doc(`${collectionName}/${documentName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(documentRef).then(function (targetDocument) {

        let currentDocData = targetDocument.data();
        let updateDocData = updateFunc(currentDocData);

        transaction.update(documentRef, updateDocData);
      })
    })
  }

  //Batch functions--------------------------------------------------

  /**
   * Return a batch we can add writes to.  (Used in Game classes.)
   */
  getWriteBatch = function () {
    return this.firestoreDb.batch();
  };

  //Pretty much never use this since it's really destructive - stick to update to avoid overwrites
  /**
   * Add a "Set" operation to the batch
   * @param {object} batch 
   * @param {string} col 
   * @param {string} doc 
   * @param {object} dataToUpdate 
   */
  addToBatchSet(batch, col, doc, dataToUpdate) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.set(ref, dataToUpdate);
    return batch;
  }

  //THIS IS THE ONE TO USE (...most likely)
  /**
   * Add a "Update" operation to the batch
   * @param {object} batch 
   * @param {string} col 
   * @param {string} doc 
   * @param {object} dataToUpdate 
   */
  addToBatchUpdate(batch, col, doc, dataToUpdate) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.update(ref, dataToUpdate);
    return batch;
  }

  //Pretty much never use this since it's really destructive - stick to update to avoid overwrites
  /**
   * Add a "Delete" operation to the batch
   * @param {object} batch 
   * @param {string} col 
   * @param {string} doc 
   */
  addToBatchDelete(batch, col, doc) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.delete(ref);
    return batch;
  }

  /**
   * Commit all the writes in the batch to the database.
   * @param {object} batch 
   */
  commitWriteBatch = function (batch) {
    if (batch) {
      batch.commit().then(
        () => sgf.mainFramework.megaLog("Successful batch write!")
      );
    }
    else
      sgf.mainFramework.megaLog("No batch to commit...");
  }





}