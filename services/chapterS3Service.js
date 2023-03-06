const aws = require("aws-sdk");

const BUCKET = `chapters-info-${process.env.STAGE}`;
const ALL_CHAPTER_OBJECT_INFO = "fullChaptersInfo.json";

const getObject = (objectKey) => {
  const s3 = new aws.S3();

  return s3
    .getObject({
      Key: objectKey,
      Bucket: BUCKET,
    })
    .promise();
};

const getFileContent = (rawFileContent) =>
  rawFileContent ? JSON.parse(rawFileContent.Body.toString("utf-8")) : {};

const getAllChapterInfo = async () => {
  try {
    const allInfo = await getObject(ALL_CHAPTER_OBJECT_INFO);

    return getFileContent(allInfo);
  } catch (error) {
    if (error.message.includes("The specified key does not exist")) return {};

    throw error;
  }
};

const getNewSeriesInfo = async (key) => {
  const newSeriesInfo = await getObject(key);

  return getFileContent(newSeriesInfo);
};

const putObject = (key, fileContent) => {
  const s3 = new aws.S3();

  return s3
    .putObject({
      Key: key,
      Body: JSON.stringify(fileContent),
      Bucket: BUCKET,
    })
    .promise();
};

const updateChapters = (fileContent) =>
  putObject(ALL_CHAPTER_OBJECT_INFO, fileContent);

module.exports = { getAllChapterInfo, updateChapters, getNewSeriesInfo };
