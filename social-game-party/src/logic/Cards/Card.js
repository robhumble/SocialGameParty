export default class Card {

    Id = ""

    CardType = ""

    //Traditional Card Properties
    Suit = ""
    Color = ""
    Value = ""

    //Other Card Properties
    Title = ""
    Message = ""

    isFaceUp = false

    constructor() {
    }

    populateTraditional(id, suit, color, value) {
        this.CardType = "traditional";

        this.Id = id;

        this.Suit = suit;
        this.Color = color;
        this.Value = value;
    }

    populateOther(id, title, mes) {
        this.CardType = "message";

        this.Id = id;

        this.Title = title;
        this.Message = mes;
    }

    flipCard() {
        this.isFaceUp = !this.isFaceUp;
    }



    toMap() {

        let mapObj = {

            Id: this.Id,

            CardType: this.CardType,

            //Traditional Card Properties
            Suit: this.Suit,
            Color: this.Color,
            Value: this.Value,

            //Other Card Properties
            Title: this.Title,
            Message: this.Message,

            isFaceUp: this.isFaceUp,
        }

        return mapObj;
    }

    fromMap(mapObj) {

        this.Id = mapObj.Id;

        this.CardType = mapObj.CardType;

        //Traditional Card Properties
        this.Suit = mapObj.Suit;
        this.Color = mapObj.Color;
        this.Value = mapObj.Value;

        //Other Card Properties
        this.Title = mapObj.Title;
        this.Message = mapObj.Message;

        this.isFaceUp = mapObj.isFaceUp;
    }



}


