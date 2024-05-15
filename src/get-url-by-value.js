require("dotenv").config();
function getUrlVideoByValueMQTT(value, listVideo) {
  const result = listVideo.find((item) => {
    if (item.stt !== undefined) {
      if (item.stt === +value) return true;
      else return false;
    }
    return false;
  });
  if (result === undefined) {
    return process.env.VIDEO_DEFAULT;
  }
  return result?.url ? result.url : process.env.VIDEO_DEFAULT;
}
module.exports = getUrlVideoByValueMQTT;
