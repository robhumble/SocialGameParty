import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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
        () => console.log("Successful batch write!")
      );
    }
    else
      console.log("No batch to commit...");
  }

}