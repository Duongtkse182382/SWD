import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "../../utils/axiosInstance";

export default function BookingTherapist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [visibleNoteIndex, setVisibleNoteIndex] = useState(null);
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("/api/consultants");
      setConsultants(
        res.data.map((c) => ({
          ...c,
          note: c.note,
          image: c.image,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch consultants:", err);
    }
  };

  const handleBookingNow = async (consultantId) => {
    localStorage.setItem("consultantId", consultantId);
    sessionStorage.setItem("consultantId", consultantId);
    localStorage.setItem(
      "serviceUrl",
      `/services/${id}/chon-chuyen-vien/${consultantId}/lich-hen`
    );
    sessionStorage.setItem(
      "serviceUrl",
      `/services/${id}/chon-chuyen-vien/${consultantId}/lich-hen`
    );
    navigate(`/services/${id}/chon-chuyen-vien/${consultantId}/lich-hen`);
  };

  const handleViewMore = (index) => {
    setVisibleNoteIndex(visibleNoteIndex === index ? null : index);
  };

  return (
    <div className="main-container w-full min-h-screen bg-[#F5F5F5] font-['Lato']">
      <Navbar />
      {/* Services Hero Section */}
      <div className="h-[500px] w-full flex items-center justify-center text-white text-center"
        style={{
          backgroundImage: "url('/images/service.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}>
        <h1 className="text-5xl font-semibold bg-opacity-50 px-6 py-4 rounded-lg">Chọn chuyên viên của bạn</h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/services")}
          className="mb-6 text-lg text-[#2B6A7C] hover:text-[#1E4F60] transition duration-200"
        >
          ← Back to Services
        </button>

        {/* Consultants List */}
        <div className="space-y-6">
          {consultants.map((consultant, index) => (
            <div
              key={consultant._id}
              className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 gap-6"
            >
              {/* Consultant Image */}
              <div className="w-[150px] h-[150px] flex-shrink-0">
                {consultant.image ? (
                  <img
                    src={consultant.image}
                    alt="Consultant"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              {/* Consultant Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#2B6A7C]">
                  {consultant.firstName} {consultant.lastName}
                </h2>
                <p className="text-gray-600 mt-2">{consultant.note}</p>

                {/* Additional Notes */}
                {visibleNoteIndex === index && (
                  <p className="text-gray-600 mt-2">
                    No additional notes available.
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-4 mt-4">
                  <button
                    className="px-6 py-2 bg-[#A7DFEC] text-[#2B6A7C] rounded-full hover:bg-[#2B6A7C] hover:text-white transition duration-300"
                    onClick={() => handleViewMore(index)}
                  >
                    {visibleNoteIndex === index ? "Hide" : "Xem thêm"}
                  </button>
                  <button
                    className="px-6 py-2 bg-[#2B6A7C] text-white rounded-full hover:bg-[#1E4F60] transition duration-300"
                    onClick={() => handleBookingNow(consultant._id)}
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Let Us Choose For You Button */}
        <div className="flex justify-center mt-10">
          <button
            className="px-8 py-3 bg-[#A7DFEC] text-[#2B6A7C] rounded-full border-2 border-[#2B6A7C] hover:bg-[#2B6A7C] hover:text-white transition duration-300 shadow-lg"
            onClick={() => {
              localStorage.setItem("consultantId", null);
              localStorage.setItem(
                "serviceUrl",
                `/services/${id}/chon-chuyen-vien/null/lich-hen`
              );
              navigate(`/services/${id}/chon-chuyen-vien/null/lich-hen`);
            }}
          >
            <span className="text-lg font-bold">
              Hãy để cho chúng tôi đặt cho bạn
            </span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}