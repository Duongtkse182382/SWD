import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Footer from "../../components/Footer";

export default function About() {

    const [cart, setCart] = useState([]);
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    useEffect(() => {
        setCart(cartData);
    }, []);

    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            {/* Header */}
            <Navbar cart={cart} setCart={setCart} /> {/* Pass setCart to Navbar */}

            {/* Hero Section */}
            <div
                className="h-[500px] w-full flex items-center justify-center text-white text-center"
                style={{
                    backgroundImage: "url('/images/home.png')",
                    backgroundSize: "cover",  // Giúp ảnh bao phủ toàn bộ phần hero
                    backgroundPosition: "center",  // Căn giữa ảnh
                    backgroundRepeat: "no-repeat", // Không lặp lại ảnh
                    backgroundAttachment: "fixed"  // Cố định ảnh khi cuộn trang
                }}
            >
                <h1 className="text-6xl font-semibold bg-opacity-50 px-6 py-4 rounded-lg">Câu chuyện của chúng tôi</h1>
            </div>

            {/* Body Section */}

            <div className="max-w-5xl mx-auto px-6 py-16 text-gray-800">
                <h2 className="text-3xl font-bold text-center mb-6">
                    <span className="text-[#075E76]">LÀN DA KHỎE ĐẸP</span> TỪ THIÊN NHIÊN - AN TOÀN VÀ HIỆU QUẢ!
                </h2>
                <p className="text-lg text-center leading-relaxed">
                    Từ năm 1973, Revivalabs đã theo đuổi một sứ mệnh duy nhất: tạo ra những sản phẩm chăm sóc da an toàn, hiệu quả và mang lại kết quả rõ rệt với mức giá hợp lý.
                    Chúng tôi tự hào khi biết rằng sản phẩm của mình được tin dùng qua nhiều thế hệ – từ bà, mẹ đến con gái.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    <img src="client/public/images/about_2.png" alt="Lịch sử thương hiệu" className="rounded-lg shadow-lg" />
                    <div>
                        <p className="text-lg leading-relaxed">
                            Hành trình của Revivalabs là một câu chuyện về sự đổi mới, niềm tin và sự bền vững. Từ những ngày đầu tiên, chúng tôi đã theo đuổi 100% nguyên liệu thiên nhiên, trước khi xu hướng này trở thành phổ biến trên toàn cầu.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed">
                            Ngày nay, chúng tôi tiếp tục phát triển những sản phẩm chăm sóc da tự nhiên giúp bạn có làn da rạng rỡ và khỏe mạnh hơn mỗi ngày. Hãy cùng chúng tôi viết tiếp câu chuyện này!
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}


