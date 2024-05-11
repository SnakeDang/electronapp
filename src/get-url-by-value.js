function getUrlVideoByValueMQTT(value, listVideo) {
  const result = listVideo.find((item) => {
    if (item.stt !== undefined) {
      if (item.stt === +value) return true;
      else return false;
    }
    return false;
  });
  if (result === undefined) {
    const url = listVideo[0]?.url ? listVideo[0].url : "";
    console.log("000000000000000");
    console.log("000000000000000");
    console.log("000000000000000");
    console.log(url);
    return url;
  }
  return result?.url ? result.url : "";
}
module.exports = getUrlVideoByValueMQTT;
