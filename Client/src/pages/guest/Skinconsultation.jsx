import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar, FaAngleRight , FaAngleLeft  } from 'react-icons/fa';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import axios from "../../utils/axiosInstance";


export default function Skinconsultation() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [visibleNoteIndex, setVisibleNoteIndex] = useState(null);
    const [consultants, setConsultants] = useState([]);
    const [cart, setCart] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [detailedFeedbacks, setDetailedFeedbacks] = useState([]); // Thêm state riêng cho bình luận chi tiết
    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0); // State for pagination
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    useEffect(() => {
        setCart(cartData);
    }, []);

    useEffect(() => {
        fetchConsultants();
        fetchFeedbacks();
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

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`/api/feedbacks/consultant-rating`);
            setFeedbacks(res.data);
        } catch (err) {
            console.error("Failed to fetch feedbacks:", err);
        }
    };

    const fetchConsultantFeedbacks = async (consultantId) => {
        try {
            const res = await axios.get(`/api/feedbacks/consultant/${consultantId}`);
            return res.data;
        } catch (err) {
            console.error("Failed to fetch consultant feedbacks:", err);
            return [];
        }
    };

    const getFeedbackForConsultant = (consultantId) => {
        return feedbacks.filter(feedback => feedback._id === consultantId);
    };

    const getAverageRating = (consultantId) => {
        const feedback = feedbacks.find(feedback => feedback._id === consultantId);
        return feedback ? feedback.averageRating.toFixed(1) : "0.0";
    };

    const getCustomerName = (bookingRequestId) => {
        const feedback = feedbacks.find(feedback => feedback.bookingRequestId === bookingRequestId);
        return feedback && feedback.bookingRequestId && feedback.bookingRequestId.customerId
            ? feedback.bookingRequestId.customerId.name
            : "Customer";
    };

    // const handleBookingNow = async (consultantId) => {
    //     localStorage.setItem("consultantId", consultantId);
    //     sessionStorage.setItem("consultantId", consultantId);
    //     localStorage.setItem(
    //         "serviceUrl",
    //         `/dịch/${id}/chon-chuyen-vien/${consultantId}/lich-hen`
    //     );
    //     sessionStorage.setItem(
    //         "serviceUrl",
    //         `/dịch vụ/${id}/chon-chuyen-vien/${consultantId}/lich-hen`
    //     );
    //     navigate(`/dịch vụ/${id}/chon-chuyen-vien/${consultantId}/lich-hen`);
    // };

    const handleViewMore = async (index, consultantId) => {
        setVisibleNoteIndex(visibleNoteIndex === index ? null : index);
        if (visibleNoteIndex !== index) {
            const feedbacks = await fetchConsultantFeedbacks(consultantId);
            setDetailedFeedbacks(feedbacks); // Lưu bình luận chi tiết vào state riêng
        }
    };

    const handleNextFeedback = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            (prevIndex + 1) % detailedFeedbacks.length
        );
    };

    const handlePreviousFeedback = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            (prevIndex - 1 + detailedFeedbacks.length) % detailedFeedbacks.length
        );
    };

    return (
        <div className="main-container w-full min-h-screen bg-[#F5F5F5]">
            <Navbar cart={cart} setCart={setCart} /> {/* Pass setCart to Navbar */}
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

                                {/* Average Rating */}
                                <div className="flex items-center mt-4">
                                    <div className="flex text-yellow-500 text-2xl mr-2">
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const starValue = i + 1;
                                            if (getAverageRating(consultant._id) >= starValue) {
                                                return <FaStar key={i} />;
                                            } else if (getAverageRating(consultant._id) >= starValue - 0.5) {
                                                return <FaStarHalfAlt key={i} />;
                                            } else {
                                                return <FaRegStar key={i} />;
                                            }
                                        })}
                                    </div>
                                    <span className="text-gray-700 text-lg">
                                        ({getAverageRating(consultant._id)} / 5)
                                    </span>
                                </div>

                                {/* Additional Notes */}
                                {visibleNoteIndex === index && (
                                    <div className="text-gray-600 mt-2">
                                        <h3 className="text-xl text-[#2B6A7C] font-semibold">Đánh giá của khách hàng</h3>
                                        {detailedFeedbacks.length > 0 ? (
                                            <div className="mt-2">
                                                <p>
                                                    <strong>
                                                        {detailedFeedbacks[currentFeedbackIndex]?.bookingRequestId?.customerID?.firstName || "Anonymous"}:
                                                    </strong>
                                                    {detailedFeedbacks[currentFeedbackIndex]?.consultantComment || "No comment"}
                                                </p>
                                                <div className="flex gap-1 mt-4">
                                                    <button
                                                        className="px-4 py-2 bg-[#A7DFEC] text-[#2B6A7C] rounded-full hover:bg-[#2B6A7C] hover:text-white transition duration-300"
                                                        onClick={handlePreviousFeedback}
                                                    >
                                                        <FaAngleLeft />
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-[#A7DFEC] text-[#2B6A7C] rounded-full hover:bg-[#2B6A7C] hover:text-white transition duration-300"
                                                        onClick={handleNextFeedback}
                                                    >
                                                        <FaAngleRight />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>Không có đánh giá khả dụng.</p>
                                        )}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-4 mt-4 font-semibold">
                                    <button
                                        className="px-6 py-2 bg-[#A7DFEC] text-[#2B6A7C] rounded-full hover:bg-[#2B6A7C] hover:text-white transition duration-300"
                                        onClick={() => handleViewMore(index, consultant._id)}
                                    >
                                        {visibleNoteIndex === index ? "Ẩn" : "Xem thêm"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Booking Now Button */}
                <div className="fixed bottom-4 right-4">
                    {/* Ping effect */}
                    <span className="absolute -inset-1 inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>

                    {/* Animated Button */}
                    <motion.button
                        onClick={() => navigate("/dịch vụ")}
                        className="relative px-6 py-3 text-white rounded-full shadow-lg pacifico-regular focus:outline-none focus:ring-4 focus:ring-green-300"
                        style={{
                            background: "linear-gradient(135deg, #6B8E23, #32CD32)",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                        }}
                        animate={{
                            y: [0, -5, 5, -5, 0], // Floating animation
                            transition: {
                                duration: 7,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                        whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Đặt lịch ngay
                    </motion.button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

