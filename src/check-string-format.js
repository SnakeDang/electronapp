function checkStringFormat(str) {
  // Khai báo biểu thức chính quy
  const regex = /^\[.+?\] - \[.+?\]:::.+$/;
  // Kiểm tra xem chuỗi có khớp với biểu thức chính quy không
//   "[robot1] - [topic1]:::value1" ==> true
  return regex.test(str);
}
module.exports = checkStringFormat;
