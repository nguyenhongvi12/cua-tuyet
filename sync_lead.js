/**
 * GOOGLE APPS SCRIPT: ĐỒNG BỘ THÔNG TIN LEAD VÀO GOOGLE SHEET
 */

const SPREADSHEET_ID = "1VJ0CP3083dfM5MMqMsL0yvSF6Yo0H8PU95KdKMUgyOM";
const SHEET_NAME = "Lead";

function doPost(e) {
  const result = {
    status: "success",
    message: "Dữ liệu đã được lưu thành công!"
  };

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      const contents = e.postData.contents;
      const mimeType = e.postData.type;
      
      if (mimeType && mimeType.indexOf("application/json") !== -1) {
        payload = JSON.parse(contents);
      } else {
        payload = parseQueryString(contents);
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }

    // 1. Trích xuất thông tin
    const timeValue = payload.thoi_gian || payload.timestamp || payload.time || payload.date || getFormattedDate();
    const nameValue = payload.ten || payload.name || payload.fullname || payload.fullName || "";
    const phoneValue = payload.so_dien_thoai || payload.sdt || payload.phone || payload.phoneNumber || payload.phone_number || "";
    const paymentValue = payload.thanh_toan || payload.payment || payload.status || "Chưa thanh toán";

    // 2. Sinh Mã Đơn Hàng ngẫu nhiên: AI + 10 số ngẫu nhiên
    let orderCodeValue = "AI";
    for (let i = 0; i < 10; i++) {
      orderCodeValue += Math.floor(Math.random() * 10);
    }

    // 3. Số Tiền cố định 19.000đ
    const amountValue = "19.000đ";

    // 4. Mở Google Sheet và ghi dữ liệu
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu sheet chưa tồn tại, tạo mới và thêm tiêu đề 6 cột (A-F)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        "Thời gian", 
        "Tên", 
        "Số điện thoại", 
        "Thanh toán", 
        "Mã Đơn Hàng", 
        "Số Tiền"
      ];
      sheet.appendRow(headers);
      
      // Định dạng Header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#E0F7FA");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Ghi dòng dữ liệu mới tương ứng 6 cột
    const newRow = [
      timeValue,
      nameValue,
      phoneValue,
      paymentValue,
      orderCodeValue,
      amountValue
    ];
    
    sheet.appendRow(newRow);
    
    result.data = newRow;
    result.orderCode = orderCodeValue;
    result.amount = amountValue;

  } catch (error) {
    result.status = "error";
    result.message = "Đã xảy ra lỗi: " + error.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const info = {
    status: "active",
    message: "Google Apps Script Web App đang hoạt động tốt!",
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME
  };
  return ContentService.createTextOutput(JSON.stringify(info))
    .setMimeType(ContentService.MimeType.JSON);
}

function getFormattedDate() {
  const now = new Date();
  const timeZone = "Asia/Ho_Chi_Minh";
  return Utilities.formatDate(now, timeZone, "dd/MM/yyyy HH:mm:ss");
}

function parseQueryString(queryString) {
  const params = {};
  const pairs = queryString.split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    const key = decodeURIComponent(pair[0]);
    const value = pair[1] ? decodeURIComponent(pair[1].replace(/\+/g, " ")) : "";
    if (key) {
      params[key] = value;
    }
  }
  return params;
}
