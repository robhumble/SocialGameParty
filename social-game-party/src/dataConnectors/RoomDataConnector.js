import DataConnector from "@/dataConnectors/DataConnector";

/**
 * DataConnector for interacting with "Rooms".
 */
export default class RoomDataConnector extends DataConnector {

    constructor() {
        super();
    }

   // Firebase functions for room movement. -----------------------------

  // presently, make room does not check if the room already exists. 
  /**
   * Create a new Room and automatically join it as a specatator.
   * @param {string} newRoomName 
   * @param {userObj} userObj 
   */
  makeRoom = function (newRoomName, userObj) {

    let userArr = [userObj];

    // This line creates both the room and the document inside that will hold the array of users.
    this.firestoreDb.doc(`rooms/${newRoomName}`).set({
      users: userArr,
      chatText: ""
    });

  };

  // PLEASE remember these commands are caps sensitive in firebase.
  /**
   * Join the target room if found.
   * @param {string} joinRoomName 
   * @param {userObj} userObj 
   * @param {function} updateRoomFunction - runs after transaction to update the UI.
   * @param {boolean} alertUser - true alerts the user if the room wasn't found, false suppresses the alert.
   */
  joinRoom = function (joinRoomName, userObj, updateRoomFunction, alertUser = true) {
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
    if (roomName) { //remove the user from the room they are in when they move, if they are in a room
      let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

      this.firestoreDb.runTransaction(function (transaction) {
        return transaction.get(roomDocRef).then(function (roomDoc) {
          let allUsers = roomDoc.data().users;

          let updatedUsers = allUsers.filter(x => x.id != userId);

          transaction.update(roomDocRef, { users: updatedUsers });
        })
      })

    }
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
    console.log(userId + roomName);

    let roomDocRef = this.firestoreDb.doc(`rooms/${roomName}`);

    this.firestoreDb.runTransaction(function (transaction) {
      return transaction.get(roomDocRef).then(function (roomDoc) {

        let allUsers = roomDoc.data().users
        allUsers.forEach(user => that.updateUserPlayingStatus(user, userId, false));
        transaction.update(roomDocRef, { users: allUsers });

      })
    })
  }

  /**
   * Listen to the target room's user list.
   * @param {function} onSnapshotFunction - function runs after the user list is retrieved.
   * @param {string} roomName 
   */
  listenToUsers = function (onSnapshotFunction, roomName) {

    //While this should be a listener, I am concerned changes that aren't the userlist will be sent. 
    this.firestoreDb
      .collection("rooms")
      .doc(roomName)
      .onSnapshot(function (doc) {
        let remoteUserList = doc.data().users;
        onSnapshotFunction(remoteUserList);
      });
  };

  /**
   * Attempt to join the room, but don't alert the user if it can't be found.
   * @param {string} joinRoomName 
   * @param {userObj} userObj 
   * @param {function} updateRoomFunction - runs after transaction to update the UI.
   */
  rejoinRoom = function (joinRoomName, userObj, updateRoomFunction) {
    this.joinRoom(joinRoomName, userObj, updateRoomFunction, false);
  }

  /**
   * Set's whether or not a user is playing the game.
   * @param {userObj} userObj 
   * @param {number} targetId 
   * @param {boolean} isPlayingStatus 
   */
  updateUserPlayingStatus = function (userObj, targetId, isPlayingStatus) {
    if (userObj.id == targetId)
      userObj.isPlaying = isPlayingStatus;
  }
}