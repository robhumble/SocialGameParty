import DataConnector from "@/dataConnectors/DataConnector";
//import { SessionUser } from "@/logic/SessionInfo.js";


/**
 * Data connector for Game Data that the host needs to listen to.
 */
export default class HostGameDataConnector extends DataConnector {

  constructor() {
    super();
  } 

  #connectorCollectionName = "hostGameData";

  makeHostGameData = async function (roomName) {

    let hostDataDbModel = this.buildHostGameDataDbModel();

    var existingDoc = await this.firestoreDb.collection(this.#connectorCollectionName).doc(roomName).get();

    if (existingDoc.data())
      throw Error("Document already exists!");

    // This line creates both the document and the data inside of it
    this.firestoreDb.doc(`${this.#connectorCollectionName}/${roomName}`).set(hostDataDbModel);

  };

  //Private Helpers-------------------------------------->

  buildHostGameDataDbModel = function () {
    let dbModel = {

      results = [],

      //This is a general container for data that needs to be stored by the current game.
      dynamicHostGameData: {},  //Dynamically generated data that only active players care about (probably private, and also only stuff that is relevant to other active players)
    }

    return dbModel;
  }

}