import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

/**
 * BASE DataConnector class - other DataConnector classes inherit from this.
 */
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


  getWriteBatch = function () {
    return this.firestoreDb.batch();
  };

  //Pretty much never use this since it's really destructive - stick to update to avoid overwrites
  addToBatchSet(batch, col, doc, dataToUpdate) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.set(ref, dataToUpdate);
    return batch;
  }

  //THIS IS THE ONE TO USE (...most likely)
  addToBatchUpdate(batch, col, doc, dataToUpdate) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.update(ref, dataToUpdate);
    return batch;
  }

  //Pretty much never use this since it's really destructive - stick to update to avoid overwrites
  addToBatchDelete(batch, col, doc) {
    let ref = this.firestoreDb.collection(col).doc(doc);
    batch.delete(ref);
    return batch;
  }

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