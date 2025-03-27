import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // Hiển thị 3 comment đầu tiên
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Chỉ số ảnh hiện tại

  const loadMore = () => { setVisibleCount(prev => prev + 3); };

  useEffect(() => {
    axios
      .get(`/api/services/${id}`)
      .then((response) => {
        setService(response.data);

        setGalleryImages([
          response.data.image,
          response.data.effectimage,
          response.data.resultimage,
          response.data.sensationimage,
        ].filter(img => img)); // Loại bỏ ảnh null hoặc undefined
      })
      .catch((error) => {
        console.error("Error fetching service:", error);
        setError("Failed to load service details.");
        setService(null);
      });

    axios
      .get(`/api/feedbacks/service/${id}`)
      .then((response) => setComments(response.data))
      .catch((error) => {
        console.error("Error fetching comments:", error);
        setComments([]);
      });

    axios
      .get(`/api/feedbacks/service-rating/${id}`)
      .then((response) => {
        const ratingData = response.data[0] || { averageRating: 0 };
        setAverageRating(ratingData.averageRating);
      })
      .catch((error) => {
        console.error("Error fetching service rating:", error);
        setAverageRating(0);
      });

  }, [id]);

  const handleBookingNow = async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    localStorage.setItem("serviceId", id);
    sessionStorage.setItem("serviceId", id);
    localStorage.setItem("serviceUrl", `/dịch vụ/${id}/chon-chuyen-vien`);
    sessionStorage.setItem("serviceUrl", `/dịch vụ/${id}/chon-chuyen-vien`);
    navigate(`/dịch vụ/${id}/chon-chuyen-vien`);
    console.log("Navigating to:", `/dịch vụ/${id}/chon-chuyen-vien`);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  if (error) return <div className="text-red-600 text-center mt-10">{error}</div>;
  if (!service) return <div className="text-center text-gray-600 mt-10">Loading...</div>;

  return (
    <div className="main-container w-full h-auto bg-[#f9faef] relative overflow-hidden mx-auto my-0">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-10 mb-10">
        <button
          onClick={() => navigate("/dịch vụ")}
          className="mb-2 text-lg text-[#2B6A7C] hover:text-[#A7DFEC] self-end"
        >
          ← Về trang trước
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 rounded-lg shadow-lg">
          {service.image && (
            <div className="w-full max-h-[60vh] overflow-hidden flex justify-center items-center">
              <ImageGallery
                items={galleryImages.map((img) => ({ original: img }))}
                showThumbnails={false}
                showFullscreenButton={false}
                showPlayButton={false}
                slideDuration={600} // Increase the duration for smoother transition
                slideInterval={3000} // Set the interval for automatic slide transition
                showBullets={false}
                showNav={false}
                startIndex={currentImageIndex}
                additionalClass="object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-5xl font-extrabold text-[#2B6A7C] leading-tight">{service.name}</h1>

            <p className="mt-6 text-lg text-gray-700 leading-relaxed">{service.description}</p>
            <div
              className="text-gray-600 mt-6 leading-relaxed border-t-2 border-gray-200 pt-6"
              dangerouslySetInnerHTML={{ __html: service.detaildescription }}
            />
            {/* Hiển thị avg sao rating của ServiceId tương ứng bằng filter */}

            <div className="flex items-center mt-4">
              <span className="text-yellow-500 text-2xl mr-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const starValue = i + 1;
                  if (averageRating >= starValue) {
                    return <FaStar key={i} />;
                  } else if (averageRating >= starValue - 0.5) {
                    return <FaStarHalfAlt key={i} />;
                  } else {
                    return <FaRegStar key={i} />;
                  }
                })}
              </span>
              <span className="text-gray-700 text-lg">({averageRating.toFixed(1)} / 5)</span>
            </div>

            {/* Product Price */}
            <div className=" text-2xl font-bold text-[#2B6A7C] mt-4">
              Giá: {service.price.toLocaleString('vi-VN')} VND
            </div>

            {/* Booking Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleBookingNow}
                className="w-[169px] h-[44px] rounded-full border-solid border-[1px] text-[20px] font-bold leading-[24px] text-[#2B6A7C] pacifico-regular flex items-center justify-center hover:bg-[#e6feff] bg-[#A7DFEC] transition duration-300"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(3deg)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Đặt dịch vụ
              </button>
            </div>

          </div>
        </div>

        {/* Additional Images */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[service.image, service.effectimage, service.resultimage, service.sensationimage].filter(img => img).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Service Image ${index}`}
              className="w-full h-40 object-cover rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300 cursor-pointer"
              onClick={() => setCurrentImageIndex(index)} // Cập nhật chỉ số ảnh hiện tại

            />
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {comments.slice(0, visibleCount).map((comment, index) => {
            // Kiểm tra nếu có bookingRequestId và customerID
            const customer = comment.bookingRequestId?.customerID;
            const avatarUrl = customer?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            const fullName = customer ? `${customer.firstName} ${customer.lastName}` : "Anonymous";

            return (
              <div key={index} className="border-b border-gray-200 pb-6 mb-6">
                <div className="mt-3 flex items-center gap-3 mb-3">
                  {/* Avatar */}
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />

                  {/* Tên và Rating */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-lg">{fullName}</p>

                    {/* Rating sao */}
                    <div className="flex text-yellow-500 text-sm">
                      {Array.from({ length: Math.max(0, Math.min(comment.serviceRating, 5)) }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <p className="text-gray-700 mt-2 leading-relaxed">
                  {comment.serviceComment || comment.consultantComment}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Log in to booking
            </h3>
            <p className="text-gray-600">You need to be logged in to book now. Do you want to log in now?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#A7DFEC] text-white rounded-lg hover:bg-[#2B6A7C] transition"
                onClick={handleLoginRedirect}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}