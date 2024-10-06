// lib/axiosClient.ts
import axios from "axios";

// Tạo một instance axios với một base URL
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1", // Đặt base URL của bạn ở đây
  headers: {
    "Content-Type": "application/json", // Đặt tiêu đề mặc định
  },
});

// Thêm một interceptor cho yêu cầu
axiosClient.interceptors.request.use(
  (config) => {
    // Bạn có thể thêm token xác thực hoặc bất kỳ tiêu đề nào khác ở đây nếu cần
    // Ví dụ: config.headers['Authorization'] = `Bearer ${token}`;
    return config; // Trả về config đã được chỉnh sửa
  },
  (error) => {
    // Xử lý lỗi yêu cầu ở đây
    return Promise.reject(error); // Từ chối promise với lỗi
  }
);

// Thêm một interceptor cho phản hồi
axiosClient.interceptors.response.use(
  (response) => {
    return response; // Trả về phản hồi trực tiếp
  },
  (error) => {
    // Xử lý lỗi phản hồi ở đây
    if (error.response) {
      // Yêu cầu đã được gửi và máy chủ đã phản hồi với mã trạng thái
      console.error("Lỗi phản hồi:", error.response.data);
      return Promise.reject(error.response.data); // Từ chối với dữ liệu phản hồi
    } else if (error.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi
      console.error("Lỗi yêu cầu:", error.request);
      return Promise.reject(new Error("Không nhận được phản hồi từ máy chủ."));
    } else {
      // Có điều gì đó xảy ra trong việc thiết lập yêu cầu mà đã gây ra lỗi
      console.error("Lỗi:", error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);

export default axiosClient;
