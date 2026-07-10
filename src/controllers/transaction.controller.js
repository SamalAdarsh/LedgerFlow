const mongoose = require("mongoose");

const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transaction = require("../models/transaction.model");

const emailService = require("../services/email.service");
const transactionModel = require("../models/transaction.model");

/**
 * CREATING A NEW TRANSACTION (10 step process flow)
 */


const createTransaction = async (req, res) => {

  // Step: 1 Validating Request

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

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Inavlid fromAccount or toAccount",
    });
  }

  // Step 2 : Validate idempotencyKey

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status == "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status == "PENDING") {
      return res.status(200).json({
        message: "Transaction is still getting processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status == "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please try again",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status == "REVERSED") {
      return res.status(500).json({
        message: "Transaction process reversed, please try again",
        transactio5n: isTransactionAlreadyExists,
      });
    }
  }

  //Step 3: Check account status

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  // Step 4: Check balance of sender from ledger

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message:
        "Insufficient balance, Current balance is ${balance}, Requested amount is ${amount}",
    });
  }

  //Step 5: Create transaction (pending)

  let transaction;

  try {
    const session = await mongoose.startSession();

    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKeym,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    //Step 6: Create Debit Ledger Entry

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    // await (()=>{
    //     return new Promise((resolve) => setTimeout(resolve, 15 * 1000))
    // })

    //Step 7: Create Credit Ledger Entry

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    //Step 8: Mark Transaction "COMPLETED"

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    //Step 9: Commit MongoDB session

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    return res.status.json({
      message:
        "Transaction is pending due to some issues, please retry after sometime",
    });
  }

  //Step 10: Send email notification

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    messagae: "Transaction completed successfully",
    transaction: transaction,
  });
};


