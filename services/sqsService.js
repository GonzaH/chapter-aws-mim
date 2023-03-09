const aws = require("aws-sdk");

const deleteSQSMessage = (receiptHandleList) => {
  const sqs = new aws.SQS();

  const cleanHandles = Array.from(new Set(receiptHandleList));

  return Promise.allSettled(
    cleanHandles.map((receiptHandle) =>
      sqs
        .deleteMessage({
          QueueUrl: `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.ACCOUNT_NUMBER}/createSeriesQueue-${process.env.STAGE}`,
          ReceiptHandle: receiptHandle,
        })
        .promise()
    )
  );
};

module.exports = { deleteSQSMessage };
