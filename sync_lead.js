/**
 * GOOGLE APPS SCRIPT: ĐỒNG BỘ THÔNG TIN LEAD VÀO GOOGLE SHEET
 */

const SPREADSHEET_ID = "1VJ0CP3083dfM5MMqMsL0yvSF6Yo0H8PU95KdKMUgyOM";
const SHEET_NAME = "LEAD";

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
    // A. Thời gian
    const timeValue = getFormattedDate();
    // B. Họ Tên
    const nameValue = payload.ho_ten || payload.name || "";
    // C. Số điện thoại
    const phoneValue = payload.so_dien_thoai || payload.phone || "";
    // C2. Email
    const emailValue = payload.email || "";
    // D. Nhu cầu sử dụng
    const purposeValue = payload.nhu_cau || payload.purpose || "";
    // E. Khu vực giao
    const areaValue = payload.khu_vuc || payload.area || "";
    // F. Ghi chú
    const noteValue = payload.ghi_chu || payload.note || "";

    // 2. Sinh Mã Đơn Hàng ngẫu nhiên hoặc lấy từ payload
    // H. Mã đơn hàng
    let orderCodeValue = payload.ma_don_hang || "AI";
    if (orderCodeValue === "AI") {
      for (let i = 0; i < 10; i++) {
        orderCodeValue += Math.floor(Math.random() * 10);
      }
    }

    // 3. Số Tiền cố định 99.000đ
    // G. Số Tiền
    const amountValue = "99.000đ";

    // 4. Mở Google Sheet và ghi dữ liệu
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu sheet chưa tồn tại, tạo mới và thêm tiêu đề 8 cột (A-H)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        "Thời gian", 
        "Họ Tên", 
        "Số điện thoại", 
        "Nhu cầu sử dụng", 
        "Khu vực giao", 
        "Ghi chú",
        "Số tiền",
        "Mã đơn hàng",
        "Email",
        "Thanh Toán",
        "Gửi Email"
      ];
      sheet.appendRow(headers);
      
      // Định dạng Header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#E0F7FA");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Ghi dòng dữ liệu mới tương ứng 8 cột
    const newRow = [
      timeValue,
      nameValue,
      phoneValue,
      purposeValue,
      areaValue,
      noteValue,
      amountValue,
      orderCodeValue,
      emailValue,
      "UNPAID", // Trạng thái Thanh Toán mặc định
      ""        // Trạng thái Gửi Email mặc định
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
  const result = { status: "error", message: "Invalid request" };

  try {
    if (e.parameter && e.parameter.ma_don_hang) {
      const maDonHang = e.parameter.ma_don_hang;
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME);
      
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        // Cột H là Mã đơn hàng (index 7), cột J là Thanh Toán (index 9)
        let found = false;
        for (let i = data.length - 1; i >= 1; i--) {
          if (data[i][7] === maDonHang) {
            result.status = "success";
            result.payment_status = data[i][9] || "UNPAID";
            found = true;
            break;
          }
        }
        if (!found) {
          result.message = "Không tìm thấy mã đơn hàng";
        }
      } else {
        result.message = "Sheet không tồn tại";
      }
    } else {
      result.status = "active";
      result.message = "Google Apps Script Web App đang hoạt động tốt!";
      result.spreadsheetId = SPREADSHEET_ID;
    }
  } catch (error) {
    result.status = "error";
    result.message = "Lỗi: " + error.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
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
