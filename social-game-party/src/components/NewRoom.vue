<!-- This component lets the user choose what room they will join or make. It doesn't actually hit the database yet. Join pretends it works.
it was originally going to be hidden after joining a room, but it is currently our only navigation, so I left it persistent.-->
<template>
    <div>
        <h1 v-if=!clientInRoom>You are not in a game room!</h1>
        <h1 v-if=clientInRoom>You are in room: {{clientInRoom}}</h1>

        <h3>Would you like to:</h3>
        <!-- prevent loading both options at once by making the other button's value false -->
        <v-btn @click="joinARoom = true, makeARoom = false">Join a room!</v-btn>
        <span style="font-weight:bold">Or</span>
        <v-btn @click="makeARoom = true, joinARoom = false">Make a new room!</v-btn>
        <span v-if=clientInRoom style="font-weight:bold">Or</span>
        <v-btn v-if=clientInRoom @click="exitRoom(), joinARoom=false, makeARoom=false">Exit!</v-btn>

        <!-- forms for joining and making rooms respectively -->
        <div v-if=joinARoom>
            <h3>What is your room name?</h3>
            <v-container align-center>
                <v-row>
                    <v-col>
                        <v-text-field
                            outlined
                            v-model="joinRoomName"
                        ></v-text-field>
                    </v-col>
                    <v-col @click=joinRoom(joinRoomName)><v-btn>Join</v-btn></v-col>
                </v-row>
            </v-container>  
        </div>
        <div v-if=makeARoom>
            <h3>What will you name your room?</h3>
            <v-container align-center>
                <v-row>
                    <v-col>
                        <v-text-field
                            outlined
                            v-model="makeRoomName"
                        ></v-text-field>
                    </v-col>
                    <v-col @click=makeRoom(makeRoomName)><v-btn>Make</v-btn></v-col>
                </v-row>
            </v-container>
        </div>

    </div>

</template>

<script>
import DataConnector from "@/logic/DataConnector.js";


export default {
    data() {return{
        clientInRoom: "",
        joinARoom: false,
        makeARoom: false,
        joinRoomName: "",
        makeRoomName: "",
        dataConnector: new DataConnector(),
        // This user ID is created whenever the client loads the home page.
        sessionID: Math.round( Math.random() * 1000000)

    }},
    methods: {
        makeRoom(makeRoomName) {
            this.dataConnector.makeRoom(makeRoomName, this.sessionID, this.clientInRoom);
            this.clientInRoom=makeRoomName;
            this.joinARoom=false;
            this.makeARoom=false;
            this.joinRoomName="";
            this.makeRoomName="";
        },

        joinRoom(joinRoomName) {
            let success = this.dataConnector.joinRoom(joinRoomName, this.sessionID, this.clientInRoom);
            if (success){
                this.clientInRoom=joinRoomName;
            }
                this.joinARoom=false;
                this.makeARoom=false;
                this.joinRoomName="";
                this.makeRoomName="";

            
        },
        exitRoom(){
            this.dataConnector.exitRoom(this.sessionID, this.clientInRoom);
            this.clientInRoom="";
            this.joinARoom=false;
            this.makeARoom=false;
            this.joinRoomName="";
            this.makeRoomName="";
        }
    }
  }  
</script>