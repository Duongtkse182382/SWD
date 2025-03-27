import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import StaffSidebar from "../../components/StaffSidebar";
import { toast, ToastContainer } from "react-toastify";
import { MdPayment } from "react-icons/md";
import { Pagination } from "@mui/material"; // Import Pagination component

const ITEMS_PER_PAGE = 10; // Number of bookings per page

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null); // booking hiện tại khi chưa có consultant
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [sortStatus, setSortStatus] = useState(""); // State for sorting by status

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/booking-requests");
        const bookingsData = response.data;

        // Map qua và fetch từng user
        const bookingsWithCustomer = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const customerRes = await axios.get(`/api/users/${booking.customerID}`);
              return {
                ...booking,
                customerInfo: customerRes.data,
              };
            } catch (customerErr) {
              console.error(`Error fetching customer for booking ${booking._id}:`, customerErr);
              return {
                ...booking,
                customerInfo: null,
              };
            }
          })
        );

        setBookings(bookingsWithCustomer);
      } catch (err) {
        console.error(
          "Error fetching bookings:",
          err.response ? err.response.data : err.message
        );
        setError(err.response ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  const handlePaymentClick = async (bookingId) => {
    try {
      const response = await axios.post(
        `/api/payments/create-payment/${bookingId}`
      );
      const checkoutUrl = response?.data?.data?.checkoutUrl; // Correct path
      const orderCode = response?.data?.data?.orderCode; // Check if orderCode exists

      if (!checkoutUrl) {
        throw new Error("checkoutUrl is missing from API response");
      }

      localStorage.setItem("orderCode", orderCode);
      sessionStorage.setItem("orderCode", orderCode);
      localStorage.setItem("bookingId", bookingId);
      sessionStorage.setItem("bookingId", bookingId);
      window.location.href = checkoutUrl;
      toast.success(`Payment link created successfully for booking #${bookingId}`);
    } catch (err) {
      console.error("Payment API Error:", err);
      setError(err.response?.data?.message || "Failed to create payment link");
      toast.error("Failed to create payment link. Please try again.");
    }
  };

  const handleConsultantClick = async (consultantID, bookingID) => {
    if (!bookingID) {
      console.error("Invalid booking ID:", bookingID);
      setError("Invalid booking ID");
      return;
    }

    if (consultantID) {
      try {
        const response = await axios.get(`/api/users/${consultantID}`);
        setSelectedConsultant(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch consultant details"
        );
      }
    } else {
      try {
        console.log("Fetching available consultants for bookingID:", bookingID);
        console.log(
          `Request URL: http://localhost:5000/api/consultants/available/${bookingID}`
        );
        const response = await axios.get(
          `/api/consultants/available/${bookingID}`
        );
        console.log(response.data);
        setAvailableConsultants(response.data);
        setCurrentBooking(bookingID);
      } catch (err) {
        console.error("Error fetching available consultants:", err);
        setError(
          err.response?.data?.message || "Failed to fetch available consultants"
        );
      }
    }
  };

  const closeConsultantModal = () => {
    setSelectedConsultant(null);
  };

  const assignConsultant = async (bookingId, consultantId) => {
    try {
      const response = await axios.put(`/api/booking-requests/${bookingId}/assign`, {
        consultantId,
      });

      const updatedBooking = response.data;

      // Update state to reflect the change
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );

      toast.success(`✅ Consultant assigned successfully to Booking #${bookingId}`);

      // Close modal
      setAvailableConsultants([]);
    } catch (error) {
      console.error(
        "Error assigning consultant:",
        error.response?.data || error.message
      );
      toast.error("❌ Failed to assign consultant. Please try again.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/api/booking-requests/${id}/status`, {
        status: newStatus,
      });
      // Cập nhật trạng thái ngay lập tức
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id ? { ...booking, status: newStatus } : booking
        )
      );
      toast.success(`✅ Booking #${id} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
      toast.error(`❌ Failed to update status for booking #${id}`);
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.customerInfo
      ? `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`
      : "Chưa rõ";
    return customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort bookings based on status
  const sortedBookings = filteredBookings.sort((a, b) => {
    if (sortStatus) {
      if (a.status === sortStatus && b.status !== sortStatus) return -1;
      if (a.status !== sortStatus && b.status === sortStatus) return 1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt); // Default sort by creation date
  });

  const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE); // Calculate total pages
  const currentBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE); // Get bookings for current page

  return (
    <div className="flex">
      <StaffSidebar />
      <div className="p-4 w-full">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-4">Xem lịch đặt</h1>

        {/* Search and Sort Controls */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <select
            value={sortStatus}
            onChange={(e) => setSortStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Sắp xếp theo trạng thái</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Hủy</option>
          </select>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Tên khách hàng</th>
              <th className="border p-2 text-center">Dịch vụ</th>
              <th className="border p-2 text-center">Ngày</th>
              <th className="border p-2 text-center">Giờ</th>
              <th className="border p-2 text-center">Chuyên viên</th>
              <th className="border p-2 text-center">Trạng thái</th>
              <th className="border p-2 text-center">Hành động</th>
              <th className="border p-2 text-center">Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking) => (
              <tr key={booking._id} className="border">
                {/* Thêm cột Tên Khách Hàng */}
                <td className="border p-2 text-center">
                  {booking.customerInfo
                    ? `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`
                    : "Chưa rõ"}
                </td>
                <td className="border p-2 text-center">
                  {booking.serviceID?.name || "Not Available"}
                </td>

                <td className="border p-2 text-center">
                  {new Date(booking.date).toLocaleDateString()}
                </td>
                <td className="border p-2 text-center">{booking.time}</td>

                <td
                  className="border p-2 text-center cursor-pointer text-blue-500"
                  onClick={() =>
                    handleConsultantClick(
                      booking.consultantID?._id,
                      booking._id
                    )
                  }
                >
                  {booking.consultantID?.lastName || "Not Assigned"}
                </td>

                <td className="border p-2 text-center">
                  <span
                    className={`p-1 rounded ${booking.status === "Pending"
                      ? "bg-yellow-200"
                      : booking.status === "Confirmed"
                        ? "bg-blue-200"
                        : booking.status === "Completed"
                          ? "bg-green-200"
                          : "bg-red-200"
                      }`}
                  >
                    {booking.status === "Pending" ? "Chờ xác nhận" : booking.status === "Confirmed" ? "Đã xác nhận" : booking.status === "Completed" ? "Đã hoàn thành" : booking.status === "Cancelled" ? "Đã hủy" : booking.status}
                  </span>
                </td>
                <td className="border p-2 text-center">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      handleStatusUpdate(booking._id, e.target.value)
                    }
                    className="border p-1"
                  >
                    <option value="Pending" className="bg-yellow-200">Chờ xác nhận</option>
                    <option value="Confirmed" className="bg-blue-200">Xác nhận</option>
                    <option value="Completed" className="bg-green-200">Hoàn thành</option>
                    <option value="Cancelled" className="bg-red-200">Hủy</option>
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handlePaymentClick(booking._id)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                  >
                    <MdPayment className="text-white-500 text-2xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
          />
        </div>

        {/* Hiển thị chi tiết Consultant nếu đã có */}
        {selectedConsultant && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Consultant Details
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={closeConsultantModal}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">First Name:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.firstName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Last Name:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.phoneNumber || "Not Available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Role:</span>
                  <span className="text-gray-800">
                    {selectedConsultant.roleName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Verified:</span>
                  <span
                    className={`font-semibold ${selectedConsultant.verified
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {selectedConsultant.verified ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end"></div>
            </div>
          </div>
        )}


        {/* Modal for Assigning Consultant */}
        {currentBooking && availableConsultants.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Assign a Consultant
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setAvailableConsultants([])}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4"></div>
              {availableConsultants.map((consultant) => (
                <div
                  key={consultant._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      {consultant.firstName} {consultant.lastName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {consultant.email}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      assignConsultant(currentBooking, consultant._id)
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                  ></button>
                  Assign
                </div>
              ))}
            </div>
          </div>
        )
        }
      </div >
    </div >
  );
};

export default ViewBooking;
