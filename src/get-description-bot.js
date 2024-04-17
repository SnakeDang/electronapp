const logToFile = require("./writelog");

function fetchDataFromAPI(API_DESCRIPTION_BOT) {
  return fetch(API_DESCRIPTION_BOT)
    .then((response) => {
      if (!response.ok) {
        throw new Error("thất bại khi get api " + API_DESCRIPTION_BOT);
      }
      return response.json();
    })
    .then((data) => {
      const response = data.content
        ? data.content
        : "không tìm thấy key content trong api";
      return response;
    })
    .catch((error) => {
      logToFile(
        "Gọi API lấy mô tả thất bại" + error?.message ? error.message : error
      );
      return null;
    });
}

// // Sử dụng hàm để lấy dữ liệu từ API
// fetchDataFromAPI()
//     .then(data => {
//         if (data) {
//             console.log('Data from API:', data);
//         } else {
//             console.log('Failed to fetch data from API');
//         }
//     });

module.exports = fetchDataFromAPI;
