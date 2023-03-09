const {
  getAllChapterInfo,
  updateChapters,
  getNewSeriesInfo,
} = require("../services/chapterS3Service");
const { notifyNewSeries } = require("../services/notificationSNSService");
const { deleteSQSMessage } = require("../services/sqsService");

const isInvalidNumber = (toValidate, min) =>
  Number.isNaN(toValidate) || toValidate < min;

const getBody = (body) => {
  if (typeof body === "object") return body;

  return JSON.parse(body);
};

const handleS3Event = async () => {
  const s3Keys = Records.map(
    ({
      s3: {
        object: { key },
      },
    }) => key
  );

  const fileContents = await Promise.allSettled(
    s3Keys.map(async (s3Key) => {
      const { title, season = 1, chapter = 0 } = await getNewSeriesInfo(s3Key);

      return { title, season, chapter };
    })
  );

  const readFileContents = fileContents.reduce(
    (accum, { value }) => (value ? accum.concat(value) : accum),
    []
  );

  return readFileContents;
};

const parseEvent = async (event) => {
  if (event.body) {
    const { title, season = 1, chapter = 0 } = getBody(event.body);

    return [{ title, season, chapter }];
  }

  const { Records } = event;
  const isS3Event = Records.some(({ s3 }) => !!s3);

  if (isS3Event) return handleS3Event(Records);

  return Records.reduce((accum, { receiptHandle, body }) => {
    const parsedBody = JSON.parse(body);

    const populatedBody = parsedBody.map((bodyInfo) => ({
      ...bodyInfo,
      receiptHandle,
    }));

    return accum.concat(populatedBody);
  }, []);
};

const handleSeriesCreation = async ({
  title,
  season,
  chapter,
  receiptHandle,
}) => {
  if (!title) throw new Error("Title is mandatory");

  if (isInvalidNumber(Number(season), 1) || isInvalidNumber(Number(chapter), 0))
    throw new Error("Season and chapters must be numbers");

  const allChapterInfo = await getAllChapterInfo();

  if (allChapterInfo[title]) throw new Error(`${title} is already added`);

  const updatedChapterInfo = {
    ...allChapterInfo,
    [title]: { season, chapter },
  };

  await updateChapters(updatedChapterInfo);

  return { title, receiptHandle };
};

const addNewSeries = async (event) => {
  const chapterInfoList = await parseEvent(event);

  const creations = await Promise.allSettled(
    chapterInfoList.map(handleSeriesCreation)
  );

  const { titles, receiptHandle } = creations.reduce(
    ({ titles, receiptHandle }, { value }) =>
      value
        ? {
            titles: titles.concat(value.titles),
            receiptHandle: value.messageId
              ? receiptHandle.concat(messageId)
              : receiptHandle,
          }
        : { titles, receiptHandle },
    { titles: [], receiptHandle: [] }
  );

  if (titles.length) await notifyNewSeries(titles);
  if (receiptHandle.length) await deleteSQSMessage(receiptHandle);
};

const getChaptersInfo = async () => {
  const allChapterInfo = await getAllChapterInfo();

  const keys = Object.keys(allChapterInfo);

  const formatedInfo = keys.reduce((accum, title) => {
    const seriesInfo = allChapterInfo[title];

    return accum.concat({ title, ...seriesInfo });
  }, []);

  return { chapterInfo: formatedInfo };
};

const updateChapterInfo = async ({ body }) => {
  const { title, season = 1, chapter = 0 } = await getBody(body);

  if (!title) throw new Error("Title is mandatory");

  const allChapterInfo = await getAllChapterInfo();

  const specificSeriesInfo = allChapterInfo[title];
  if (!specificSeriesInfo) throw new Error(`${title} must be added beforehand`);

  const clonedInfo = { ...specificSeriesInfo };

  if (!isInvalidNumber(Number(season), 1)) clonedInfo.season = season;
  if (!isInvalidNumber(Number(chapter), 0)) clonedInfo.chapter = chapter;

  const updatedChapterInfo = {
    ...allChapterInfo,
    [title]: clonedInfo,
  };

  await updateChapters(updatedChapterInfo);
};

module.exports = { addNewSeries, getChaptersInfo, updateChapterInfo };
