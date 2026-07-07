const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be associated with an account"],
        index: "true",
        immutable:true,
    },

    amount:{
        type:Number,
        required:[true,"Amount is required for creating a Ledger Entry"],
        immutable:true

    },

    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required: [true,"Ledger must be associated with a transaction"],
        index: true,
        immutable:true,

    },

    type:{
        type:String,
        enum:{
            value:["CREDIT","DEBIT"],
            message:["Type can be either Credit or Debit"]
        },
        required: [true,"Ledger type is required"],
        immutable:true
    }

});



function preventLedgerModification(){

    throw new error("Ledger entries are immuatable cannot be modified or deleted");


}

ledgerSchema.pre("findOneAndDelete",preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification);
ledgerSchema.pre("findOneAndReplace",preventLedgerModification);
ledgerSchema.pre("remove",preventLedgerModification);
ledgerSchema.pre("deleteMany",preventLedgerModification);
ledgerSchema.pre("updateMany",preventLedgerModification);
ledgerSchema.pre("deleteOne",preventLedgerModification);
ledgerSchema.pre("updateOne",preventLedgerModification);

const ledgerModel = mongoose.model("ledger",ledgerSchema);



module.exports = ledgerModel;