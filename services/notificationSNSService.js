const aws = require("aws-sdk");

const notifyNewSeries = (seriesName) => {
  const notificationText = `Oh wow, ${seriesName.join(", ")} ${
    seriesName.length > 1 ? "are" : "is"
  } now part of the series list`;

  const sns = new aws.SNS();

  return sns
    .publish({
      Subject: "New Series",
      Message: notificationText,
      TargetArn: process.env.NEW_SERIES_SNS_ARN,
    })
    .promise();
};

module.exports = { notifyNewSeries };
