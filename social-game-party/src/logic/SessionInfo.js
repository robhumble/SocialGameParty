
export default class SessionInfo {

    #localStorageKey = "SessionInfo";

    currentRoom = null;
    currentUser = null;

    constructor(room, user) {
        this.currentRoom = room ?? new SessionRoom();
        this.currentUser = user ?? new SessionUser();
    }

    //Local storage -------------------------------------------->

    /**
     * Save important information to local storage.
     */
    saveToLocalStorage = function () {

        let dataToPersist = this.getStringRepresentation();
        localStorage.setItem(this.#localStorageKey, dataToPersist);
    }

    /**
     * Load session info found in the local storage into the current session info class.
     */
    loadFromLocalStorage = function () {

        let dataFromLocalStorage = localStorage.getItem(this.#localStorageKey);

        if (dataFromLocalStorage && dataFromLocalStorage.length > 0)
            this.populateFromStringRepresentation(dataFromLocalStorage);
    }

    /**
     * Erase the session info from local storage.
     */
    eraseSessionInfoFromLocalStorage = function () {
        localStorage.removeItem(this.#localStorageKey);
    }

    //Convert back and forth between string representation---------------------->

    /**
     * Get a simplified JSON string representation of critical session information.  (This string is intended to be saved to local storage).
     */
    getStringRepresentation = function () {
        let toFlatten = {};

        if (this.currentRoom)
            toFlatten.roomName = this.currentRoom.name;

        if (this.currentUser) {
            toFlatten.userUniqueId = this.currentUser.uniqueId;
            toFlatten.userName = this.currentUser.name;
        }

        let flattened = JSON.stringify(toFlatten);

        return flattened;
    }

    /**
     * Update this session object to match the session info data found in the dataString.  (Intended to be used when we load a session from local storage).
     * @param {string} dataString - a stringified JSON representation of a sessionInfo instance
     */
    populateFromStringRepresentation = function (dataString) {

        let dataObj = JSON.parse(dataString);

        if (dataObj) {
            let room = new SessionRoom(dataObj.roomName);
            let usr = new SessionUser(dataObj.userUniqueId, dataObj.userName);

            this.currentRoom = room;
            this.currentUser = usr;
        }

    }

}

//Room information necessary for the current session in the client
export class SessionRoom {

    name = "";

    constructor(inName) {
        this.name = inName;
    }

}

//User information necessary for the current session in the client
export class SessionUser {

    uniqueId = "";
    name = "";

    constructor(uid, inName) {
        this.uniqueId = uid ?? this.generateNewUniqueID();
        this.name = inName;
    }

    //TODO: Update this method to use an actual GUID/UUID - see https://github.com/uuidjs/uuid
    generateNewUniqueID() {
        return Math.round(Math.random() * 1000000);
    }

}


