const mongoose = require("mongoose");

const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transaction = require("../models/transaction.model");

const emailService = require("../services/email.service");

/**
 * CREATING A NEW TRANSACTION (10 step process flow)
 */

//Step: 1 Validating Request

const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "fromAccount, toAccount, amount and idempotencyKey all are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
        message: "Inavlid fromAccount or toAccount"
    })
  }
};

//Step 2 : Validate idempotencyKey

//Step 3: Check account status

//Step 4: Check balance of sender from ledger

//Step 5: Create transaction (pending)

//Step 6: Create Debit Ledger Entry

//Step 7: Create Credit Ledger Entry

//Step 8: Mark Transaction "COMPLETED"

//Step 9: Commit MongoDB session

//Step 10: Send email notification