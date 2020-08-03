
export default class SessionInfo {

    #localStorageKey = "SessionInfo";

    currentRoom = null;
    currentUser = null;

    constructor(room, user) {
        this.currentRoom = room;
        this.currentUser = user;
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

    eraseSessionInfoFromLocalStorage = function(){
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
            let room = new Room(dataObj.roomName);
            let usr = new User(dataObj.userUniqueId, dataObj.userName);

            this.currentRoom = room;
            this.currentUser = usr;
        }

    }

}

export class Room {

    name = "";

    constructor(inName) {
        this.name = inName;
    }

}

export class User {

    uniqueId = "";
    name = "";

    constructor(uid, inName) {
        this.uniqueId = uid;
        this.name = inName;
    }

}


