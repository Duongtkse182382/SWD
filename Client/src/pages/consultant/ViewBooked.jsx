import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Sidebar from "../../components/ConsultantSidebar";

const ViewBooked = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/booking-requests/my-bookings");
        const bookingsData = response.data.bookings || [];

        // Lấy feedback cho từng dịch vụ
        const bookingsWithFeedback = await Promise.all(
          bookingsData.map(async (booking) => {
            if (booking.serviceID && booking.serviceID._id) { // Ensure serviceID is not null
              try {
                const feedbackRes = await axios.get(`/api/feedbacks/service/${booking.serviceID._id}`);
                return { ...booking, feedback: feedbackRes.data[0].consultantComment || "Chưa có bình luận", rating: feedbackRes.data[0].consultantRating || "N/A" };
              } catch {
                return { ...booking, feedback: "Chưa có đánh giá ", rating: "N/A" };
              }
            }
            return { ...booking, feedback: "Chưa có đánh giá", rating: "N/A" };
          })
        );

        setBookings(bookingsWithFeedback);
      } catch (error) {
        console.error("Error fetching bookings:", error); // Log the error details
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString()} To ${endOfWeek.toLocaleDateString()}`;
  };

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const filteredBookings = selectedWeek
    ? bookings.filter((booking) => getWeekRange(new Date(booking.date)) === selectedWeek)
    : bookings;

  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    const sortedData = [...bookings].sort((a, b) => {
      const valA = a[column]?.toString().toLowerCase() || "";
      const valB = b[column]?.toString().toLowerCase() || "";

      return newSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    setBookings(sortedData);
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const toggleFeedback = (id) => {
    setExpandedFeedback((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) return <p className="text-center mt-5">Đang tải...</p>;

  const uniqueWeeks = [...new Set(bookings.map((booking) => getWeekRange(new Date(booking.date))))];

  return (
    <div className={`flex transition-opacity duration-500 ${loading ? "opacity-50" : "opacity-100"}`}>
      <Sidebar />
      <div className="ml-2 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Lịch làm việc và đánh giá</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label htmlFor="week-select" className="mr-2">Chọn tuần:</label>
          <select id="week-select" value={selectedWeek} onChange={handleWeekChange} className="border p-2">
            <option value="">Tất cả</option>
            {uniqueWeeks.map((week) => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
        </div>
        {filteredBookings.length === 0 ? (
          <p>Bạn chưa có lịch nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    { key: "serviceID.name", label: "Dịch vụ" },
                    { key: "customerID.firstName", label: "Khách hàng" },
                    { key: "date", label: "Ngày" },
                    { key: "time", label: "Giờ" },
                    { key: "status", label: "Trạng thái" },
                    { key: "feedback", label: "Bình luận" },
                    { key: "rating", label: "Đánh giá" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="border px-4 py-2 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => handleSort(key)}
                    >
                      {label} {sortBy === key && (sortOrder === "asc" ? " 🔼" : " 🔽")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="text-center">
                    <td className="border px-4 py-2">{booking.serviceID?.name || "N/A"}</td>
                    <td className="border px-4 py-2">
                      {`${booking.customerID?.firstName || ""} ${booking.customerID?.lastName || ""}`.trim() || "N/A"}
                    </td>
                    <td className="border px-4 py-2">
                      {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="border px-4 py-2">{booking.time || "N/A"}</td>
                    <td className="border px-4 py-2">{booking.status || "N/A"}</td>
                    <td className="border px-4 py-2">
                      <span onClick={() => toggleFeedback(booking._id)} className="cursor-pointer">
                        {expandedFeedback[booking._id]
                          ? booking.feedback
                          : `${booking.feedback.slice(0, 10)}...`}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      {booking.rating && booking.rating !== "N/A"
                        ? "⭐".repeat(Math.round(booking.rating))
                        : "Chưa có đánh giá"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBooked;