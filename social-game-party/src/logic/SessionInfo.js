
export default class SessionInfo {

    #localStorageKey = "SessionInfo";

    currentRoom = null;
    currentUser = null;

    constructor(room, user) {
        this.currentRoom = room ?? new SessionRoom();
        this.currentUser = user ?? new SessionUser();
    }

    //Local storage -------------------------------------------->

    saveToLocalStorage = function () {

        let dataToPersist = this.getStringRepresentation();
        localStorage.setItem(this.#localStorageKey, dataToPersist);
    }

    loadFromLocalStorage = function () {

        let dataFromLocalStorage = localStorage.getItem(this.#localStorageKey);

        if (dataFromLocalStorage && dataFromLocalStorage.length > 0)
            this.populateFromStringRepresentation(dataFromLocalStorage);
    }

    eraseSessionInfoFromLocalStorage = function () {
        localStorage.removeItem(this.#localStorageKey);
    }

    //Convert back and forth between string representation---------------------->

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


