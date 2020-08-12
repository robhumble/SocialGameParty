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

}