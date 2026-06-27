/**
 * GOOGLE APPS SCRIPT: ĐỒNG BỘ THÔNG TIN LEAD VÀO GOOGLE SHEET
 * 
 * Hướng dẫn sử dụng:
 * 1. Truy cập https://script.google.com
 * 2. Tạo một dự án mới (New Project).
 * 3. Copy toàn bộ mã nguồn này dán vào tệp `Mã.gs` (hoặc `Code.gs`).
 * 4. Nhấn Save (biểu tượng lưu).
 * 5. Nhấp vào "Triển khai" (Deploy) -> "Triển khai mới" (New deployment).
 *    - Chọn loại triển khai: "Ứng dụng web" (Web app).
 *    - Cấu hình:
 *      + Thực thi dưới dạng (Execute as): "Tôi" (Me - địa chỉ email của bạn).
 *      + Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 *    - Nhấp "Triển khai" (Deploy) và cấp quyền truy cập Google Drive/Google Sheets nếu được yêu cầu.
 * 6. Sao chép URL Web App được cấp để cấu hình vào hệ thống gửi dữ liệu (Webhook/CRM/Form).
 */

// Cấu hình ID của Google Sheet và tên trang tính
const SPREADSHEET_ID = "1VJ0CP3083dfM5MMqMsL0yvSF6Yo0H8PU95KdKMUgyOM";
const SHEET_NAME = "LEAD";

/**
 * Xử lý yêu cầu POST gửi tới Web App
 * Nhận dữ liệu Lead và lưu vào Google Sheet
 */
function doPost(e) {
  const result = {
    status: "success",
    message: "Dữ liệu đã được lưu thành công!"
  };

  try {
    // 1. Phân tích dữ liệu nhận được (hỗ trợ cả JSON payload và Form parameters)
    let payload = {};
    if (e.postData && e.postData.contents) {
      const contents = e.postData.contents;
      const mimeType = e.postData.type;
      
      if (mimeType && mimeType.indexOf("application/json") !== -1) {
        payload = JSON.parse(contents);
      } else {
        // Fallback cho định dạng URL-encoded nếu gửi từ Form thông thường
        payload = parseQueryString(contents);
      }
    } else if (e.parameter) {
      payload = e.parameter;
    }

    // 2. Trích xuất thông tin dựa trên các key phổ biến (hỗ trợ nhiều ngôn ngữ và định dạng viết key)
    const timeValue = payload.thoi_gian || payload.timestamp || payload.time || payload.date || getFormattedDate();
    const nameValue = payload.ten || payload.name || payload.fullname || payload.fullName || "";
    const emailValue = payload.email || "";
    const phoneValue = payload.so_dien_thoai || payload.sdt || payload.phone || payload.phoneNumber || payload.phone_number || "";
    const channelValue = payload.kenh_tu_van || payload.channel || payload.source || "";
    const interestValue = payload.quan_tam || payload.interest || payload.product || "";
    const paymentValue = payload.thanh_toan || payload.payment || payload.status || "Chưa thanh toán";
    const sendEmailValue = payload.goi_email || payload.send_email || payload.sendEmail || "Chưa gửi";
    const sendZaloValue = payload.goi_zalo || payload.send_zalo || payload.sendZalo || "Chưa gửi";
    const notesValue = payload.ghi_chu || payload.notes || payload.note || "";

    // Sinh Mã Đơn Hàng ngẫu nhiên: AI + 10 số ngẫu nhiên
    let orderCodeValue = "AI";
    for (let i = 0; i < 10; i++) {
      orderCodeValue += Math.floor(Math.random() * 10);
    }

    // Số Tiền mặc định là 19.000đ (hoặc lấy từ payload nếu được gửi lên)
    const amountValue = payload.so_tien || payload.amount || "19.000đ";

    // 3. Mở Google Sheet và kiểm tra sự tồn tại của Trang tính "LEAD"
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu sheet chưa tồn tại, tạo mới và thêm dòng tiêu đề (Header row)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        "Thời gian", 
        "Tên", 
        "Email", 
        "Số điện thoại", 
        "Kênh tư vấn", 
        "Quan tâm", 
        "Thanh toán", 
        "Gửi Email", 
        "Gửi Zalo", 
        "Ghi chú",
        "Mã Đơn Hàng",
        "Số Tiền"
      ];
      sheet.appendRow(headers);
      
      // Định dạng dòng tiêu đề: In đậm, nền xanh dương nhạt, viền dưới
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#E0F7FA");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // 4. Chuẩn bị dòng dữ liệu mới và ghi vào sheet (12 cột tương ứng từ A đến L)
    const newRow = [
      timeValue,
      nameValue,
      emailValue,
      phoneValue,
      channelValue,
      interestValue,
      paymentValue,
      sendEmailValue,
      sendZaloValue,
      notesValue,
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

  // 5. Trả về kết quả dưới dạng JSON cho client
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý yêu cầu GET để kiểm tra tình trạng Web App hoặc hướng dẫn nhanh
 */
function doGet(e) {
  const info = {
    status: "active",
    message: "Google Apps Script Web App đang hoạt động tốt!",
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    supportedFields: [
      "ten / name", 
      "email", 
      "so_dien_thoai / phone", 
      "kenh_tu_van / channel", 
      "quan_tam / interest", 
      "thanh_toan / payment", 
      "goi_email / sendEmail", 
      "goi_zalo / sendZalo", 
      "ghi_chu / notes"
    ]
  };
  return ContentService.createTextOutput(JSON.stringify(info))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Hàm phụ trợ: Lấy thời gian hiện tại định dạng DD/MM/YYYY HH:mm:ss theo giờ Việt Nam
 */
function getFormattedDate() {
  const now = new Date();
  // Giờ Việt Nam (GMT+7)
  const timeZone = "Asia/Ho_Chi_Minh";
  return Utilities.formatDate(now, timeZone, "dd/MM/yyyy HH:mm:ss");
}

/**
 * Hàm phụ trợ: Parse Query String sang Object (khi nhận dữ liệu từ Form URL-encoded)
 */
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
