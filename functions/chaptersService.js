const {
  getAllChapterInfo,
  updateChapters,
} = require("../services/chapterS3Service");
const { notifyNewSeries } = require("../services/notificationSNSService");

const isInvalidNumber = (toValidate, min) =>
  Number.isNaN(toValidate) || toValidate < min;

const getBody = (body) => {
  if (typeof body === "object") return body;

  return JSON.parse(body);
};

const addNewSeries = async ({ body }) => {
  const { title, season = 1, chapter = 0 } = getBody(body);

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

  await notifyNewSeries(title);
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
  const { title, season = 1, chapter = 0 } = getBody(body);

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
