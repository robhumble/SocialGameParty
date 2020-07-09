<template>
  <v-container>
    <v-row class="text-center">
      <v-col/>
      <v-col cols="12" sm="6" md="3"> 

        You are in the ChatRoom.  

           <v-text-field
            label="Display Name"
            placeholder="Your Name here..."
            v-model="displayUserName"
          ></v-text-field>

         <v-textarea
          outlined
          name="main-chat"
          label="Main Chat"
          v-model="chatText"
          disabled = true
        ></v-textarea>

        <v-textarea
          name="submit-area"
          label="Submit Area"
          v-model="submitText"
          hint="Type stuff here..."
        ></v-textarea>

        <v-btn @click="submit" >Submit</v-btn>
        
      </v-col>

      <v-col/>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'ChatRoom',

    data: () => ({     
        displayUserName:"",
        chatText:"",
        submitText:""
    }),
    methods:{
      submit: function(){
        let updateText = `${this.displayUserName}:${this.submitText} \n`;
        this.chatText += updateText;
        this.submitText = "";
      }
    }
  }
</script>
