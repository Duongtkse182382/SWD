import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PropTypes from "prop-types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";


const MyCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [events, setEvents] = useState([]);
    const [consultants, setConsultants] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [selectedConsultant, setSelectedConsultant] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const id = localStorage.getItem("consultantId");
    const serviceId = localStorage.getItem("serviceId");
    const [serviceName, setServiceName] = useState("");
    const [serviceImage, setServiceImage] = useState("");
    const [consultantImage, setConsultantImage] = useState("");

    const navigate = useNavigate();

    const times = [
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ];

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await axios.get(`/api/services/${serviceId}`);
                setServiceName(res.data.name);
                setServiceImage(res.data.image);
            } catch (err) {
                console.error("Failed to fetch service name");
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    useEffect(() => {
        const fetchConsultantById = async () => {
            try {
                if (id && id !== "null") { // Kiểm tra cả null dạng string
                    const res = await axios.get(`/api/consultants/${id}`);
                    setConsultants(res.data);
                    setConsultantImage(res.data.image);

                }
            } catch (err) {
                toast.error("Failed to fetch consultant");
            }
        };

        fetchConsultantById();
    }, [id]); // Chỉ chạy khi id thay đổi

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("/api/calendars/events", {
                    params: {
                        service: selectedService,
                        consultant: selectedConsultant
                    }
                });
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        if (selectedService && selectedConsultant) {
            fetchEvents();
        }
    }, [selectedService, selectedConsultant]);

    useEffect(() => {
        const updateAvailableTimes = () => {
            const now = new Date();
            const selectedDay = new Date(selectedDate);
            const currentTime = now.getHours() * 60 + now.getMinutes();

            let filteredTimes;
            if (selectedDay.toDateString() === now.toDateString()) {
                filteredTimes = times.filter(time => {
                    const [hour, minute] = time.split(/[: ]/);
                    const timeInMinutes = (parseInt(hour) % 12 + (time.includes("PM") ? 12 : 0)) * 60 + parseInt(minute);
                    return timeInMinutes > currentTime;
                });
            } else {
                filteredTimes = times;
            }

            setAvailableTimes(filteredTimes);
            if (filteredTimes.length > 0) {
                setSelectedTime(filteredTimes[0]);
            } else {
                setSelectedTime(null);
            }
        };

        updateAvailableTimes();
    }, [selectedDate]);


    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    // const handleConfirm = () => {
    //     Swal.fire({
    //         title: "Bạn đã chắc chắn thời gian đặt lịch?",
    //         text: "",
    //         icon: "question",
    //         showCancelButton: true,
    //         confirmButtonColor: "#A7DFEC",
    //         cancelButtonColor: "#d33",
    //         confirmButtonText: "Có, xác nhận!",
    //         cancelButtonText: "Chưa!",
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             navigate("/than-toan"); // Điều hướng đến trang sản phẩm
    //         } else {
    //             Swal.fire(
    //                 "Đặt lịch thành công!",
    //                 `Bạn đã đặt lịch vào ${selectedDate.toDateString()} lúc ${selectedTime}`,
    //                 "success"

    //             ); navigate("/xac-nhan-thong-tin");
    //         }
    //     });
    // };
    const handleConfirmBooking = () => {
        setShowConfirmModal(true); // Chỉ hiển thị popup, không gửi API
    };

    const handleConfirm = async () => {
        await createBookingRequest(); // Gửi API sau khi người dùng bấm Confirm
        setShowConfirmModal(false); // Đóng popup sau khi gửi thành công

        const successMessage = document.createElement("div");
        successMessage.innerText = `Successfully booked for ${selectedDate.toDateString()} at ${selectedTime}`;
        successMessage.style.position = "fixed";
        successMessage.style.top = "10%";
        successMessage.style.left = "50%";
        successMessage.style.transform = "translate(-50%, -10%)";
        successMessage.style.backgroundColor = "#4CAF50";
        successMessage.style.color = "white";
        successMessage.style.padding = "10px";
        successMessage.style.borderRadius = "5px";
        successMessage.style.zIndex = "1000";
        successMessage.style.fontSize = "14px";
        document.body.appendChild(successMessage);

        window.location.href = "/ve-chung-toi"; // Chuyển trang sau khi booking
    };

    const handleCancel = () => {
        localStorage.setItem("serviceId", serviceId); // Lưu dịch vụ đã chọn
        window.location.href = "/chon-chuyen-vien"; // Chuyển về trang consultant khi bấm Cancel
    };

    const isTimeDisabled = (time) => {
        const now = new Date();
        const selectedDay = new Date(selectedDate);
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [hour, minute] = time.split(/[: ]/);
        const timeInMinutes = (parseInt(hour) % 12 + (time.includes("PM") ? 12 : 0)) * 60 + parseInt(minute);

        return selectedDay.toDateString() === now.toDateString() && timeInMinutes <= currentTime;
    };

    const tileDisabled = ({ date, view }) => {
        if (view === 'month') {
            return date < new Date().setHours(0, 0, 0, 0);
        }
        return false;
    };

    const createBookingRequest = async () => {
        if (!serviceId || !selectedTime || !selectedDate) {
            toast.error("Please select a service, date, and time.");
            return;
        }
        const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);

        try {
            const payload = {
                serviceID: serviceId,
                customerID: localStorage.getItem("userId") || sessionStorage.getItem("userId"),
                date: localDate.toISOString().split("T")[0],
                time: selectedTime,
                consultantID: id && id !== "null" ? id : null,
                status: "Pending",
                isConsultantAssignedByCustomer: !!id,
            };

            const response = await axios.post("/api/booking-requests/", payload);

            if (response.status === 201) {
                toast.success("Booking request created successfully!");
                // Chỉ ẩn popup sau khi người dùng bấm Cancel hoặc hết thời gian chờ
            }
        } catch (error) {
            console.error("Error creating booking request:", error);
            toast.error("Failed to create booking request.");
        }
    };

    return (
        <div className="bg-[#F8F4F2] min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto p-4">
                <h2 className="text-center text-xl font-semibold my-4">Skincare Consultation with </h2>
                <div className="bg-white p-4 rounded-lg shadow-md flex gap-6">
                    <div>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            className="border rounded-lg p-2"
                            tileDisabled={tileDisabled}
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Available Times for {selectedDate.toDateString()}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {times.map((time, index) => (
                                <button
                                    key={index}
                                    className={`border p-2 rounded-lg text-xs font-medium ${selectedTime === time ? 'bg-[#A7DFEC] text-white' : 'bg-gray-100 hover:bg-[#a4b0b3]'}`}
                                    onClick={() => handleTimeSelect(time)}
                                    aria-label={`Select time ${time}`}
                                    disabled={isTimeDisabled(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className="bg-[#A7DFEC] text-white px-4 py-2 rounded-lg"
                                onClick={handleConfirmBooking}
                                aria-label="Confirm booking"
                            >
                                Chọn
                            </button>
                            <button
                                className="text-gray-500"
                                onClick={handleCancel}
                                aria-label="Cancel booking"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
                {/* {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex justify-center items-center transition-opacity duration-300 backdrop-blur-md">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
                            <h2 className="text-xl font-bold text-center text-[#2B6A7C] mb-6 ">Xác nhận thông tin đặt lịch</h2>
                            <p className="text-gray-700 mb-2 "><strong className="text-[#2B6A7C]">Dịch vụ:</strong> {serviceName}</p>
                            <img src={serviceImage} alt="Service" className="w-32 h-32 rounded-lg object-cover" />
                            {consultants && id !== "null" && (
                                <p className="text-gray-700 mb-4"><strong className="text-[#2B6A7C]">Chuyên viên:</strong> {consultants.firstName} {consultants.lastName}</p>
                            )}
                            <img src={consultantImage} alt="Consultant" className="w-32 h-32 rounded-lg object-cover" />
                            <p className="text-gray-700 mb-2 "><strong className="text-[#2B6A7C]">Ngày:</strong> {selectedDate.toDateString()}</p>
                            <p className="text-gray-700 mb-2 "><strong className="text-[#2B6A7C]">Thời gian:</strong> {selectedTime}</p>

                            <div className="flex justify-end gap-4 mt-6">
                                <button className="bg-[#2B6A7C] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#A7DFEC] transition duration-300 rounded-xl" onClick={handleConfirm}>Xác nhận</button>
                                <button className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 rounded-xl" onClick={() => setShowConfirmModal(false)}>Hủy</button>
                            </div>
                        </div>
                    </div>
                )} */}
                {showConfirmModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-[600px] max-w-[90%] animate-fadeIn transform transition-all duration-300 ease-in-out">
            <h2 className="text-3xl font-semibold text-center text-[#2B6A7C] mb-6">Xác nhận thông tin đặt lịch</h2>
            <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 font-medium text-lg"><strong className="text-[#2B6A7C]">Dịch vụ:</strong> {serviceName}</p>
                    <img src={serviceImage} alt="Service" className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                </div>
                {consultants && id !== "null" && (
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium text-lg"><strong className="text-[#2B6A7C]">Chuyên viên:</strong> {consultants.firstName} {consultants.lastName}</p>
                        <img src={consultantImage} alt="Consultant" className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                    </div>
                )}
                <p className="text-gray-700 font-medium text-lg"><strong className="text-[#2B6A7C]">Ngày:</strong> {selectedDate.toDateString()}</p>
                <p className="text-gray-700 font-medium text-lg"><strong className="text-[#2B6A7C]">Thời gian:</strong> {selectedTime}</p>
            </div>

            <div className="flex justify-center gap-6">
                <button 
                    className="bg-[#2B6A7C] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#1E4F60] transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2B6A7C] focus:ring-opacity-50"
                    onClick={handleConfirm}
                >
                    Xác nhận
                </button>
                <button 
                    className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    onClick={() => setShowConfirmModal(false)}
                >
                    Hủy
                </button>
            </div>
        </div>
    </div>
)}
            </div>
        </div>
    );
};

MyCalendar.propTypes = {
    selectedDate: PropTypes.instanceOf(Date),
    selectedTime: PropTypes.string,
    times: PropTypes.arrayOf(PropTypes.string),
    handleTimeSelect: PropTypes.func,
    handleConfirm: PropTypes.func,
    handleCancel: PropTypes.func,
};

export default MyCalendar;

