import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import axios from "../../utils/axiosInstance";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function About() {

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQuantityModal, setShowQuantityModal] = useState(false); // State for quantity modal
    const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
    const [quantity, setQuantity] = useState(1); // State for quantity
    const [items, setItems] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null); // State for expanded product
    const [zoomedImage, setZoomedImage] = useState(null); // State for zoomed image
    const [consultants, setConsultants] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [expandedConsultant, setExpandedConsultant] = useState(null); // State for expanded consultant

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await axios.get("/api/orders/cart");
                setCart(response.data.items);
            } catch (error) {
                console.error("Failed to fetch cart items:", error.response?.data || error.message);
                setCart([]); // Clear cart if fetching fails
            }
        };

        if (token) {
            fetchCart();
        } else {
            const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCart(storedCart);
        }
    }, [token]);

    // Function to add product to cart
    const addToCart = async (product) => {
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        setSelectedProduct(product);
        setShowQuantityModal(true);
    };

    const handleAddToCart = async () => {
        const updatedCart = [...cart, { ...selectedProduct, quantity }];
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save cart to localStorage

        try {
            let orderID = localStorage.getItem("orderID");
            const userId = localStorage.getItem("userId");
            if (!orderID) {
                const orderResponse = await axios.post("/api/orders", {
                    items: [{ productID: selectedProduct._id, quantity }],
                });
                orderID = orderResponse.data.order._id;
                localStorage.setItem("orderID", orderID);
            } else {
                try {
                    const orderResponse = await axios.get(`/api/orders/${orderID}`);
                    if (orderResponse.data.customerID !== userId) {
                        const newOrderResponse = await axios.post("/api/orders", {
                            items: [{ productID: selectedProduct._id, quantity }],
                        });
                        orderID = newOrderResponse.data.order._id;
                        localStorage.setItem("orderID", orderID);
                    } else {
                        await axios.post("/api/order-items", {
                            orderID,
                            productID: selectedProduct._id,
                            quantity,
                        });
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        const newOrderResponse = await axios.post("/api/orders", {
                            items: [{ productID: selectedProduct._id, quantity }],
                        });
                        orderID = newOrderResponse.data.order._id;
                        localStorage.setItem("orderID", orderID);
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to add item to order:", error.response?.data || error.message);
        }

        setShowQuantityModal(false);
        setQuantity(1);
    };

    const handleLoginRedirect = () => {
        setShowLoginModal(false);
        navigate("/dang-nhap");
    };

    const handleCheckout = async () => {
        try {
            const response = await axios.post("/api/orders/checkout", { items: cart });
            localStorage.removeItem("cart");
            setCart([]);
            navigate("/order-success", { state: { orderId: response.data.order._id } });
        } catch (error) {
            console.error("Checkout failed:", error);
        }
    };

    const handleViewCart = async () => {
        try {
            const response = await axios.get("/api/orders/cart");
            setCart(response.data.items);
            navigate("/product-detail");
        } catch (error) {
            console.error("Failed to fetch cart items:", error.response?.data || error.message);
            if (error.response && error.response.status === 500) {
                alert("Internal server error. Please try again later.");
            } else {
                alert("Failed to fetch cart items. Please try again later.");
            }
        }
    };

    const toggleExpand = (productId) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    const handleProductClick = (productId) => {
        navigate(`/product-detail/${productId}`);
    };

    const handleImageClick = (imgURL) => {
        setZoomedImage(imgURL);
    };

    const closeZoomedImage = () => {
        setZoomedImage(null);
    };

    const toggleConsultantNote = (consultantId) => {
        setExpandedConsultant(expandedConsultant === consultantId ? null : consultantId);
    };

    const handleConsultantImageClick = (imgURL) => {
        setZoomedImage(imgURL);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/products");
                const sortedProducts = response.data.sort((a, b) => b.sales - a.sales); // Sort products by sales
                setProducts(sortedProducts.slice(0, 4)); // Get top 4 best-selling products
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch products. Please try again later.");
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                const res = await axios.get("/api/consultants");
                setConsultants(res.data);
            } catch (err) {
                console.error("Failed to fetch consultants:", err);
            }
        };

        const fetchFeedbacks = async () => {
            try {
                const res = await axios.get("/api/feedbacks/consultant-rating");
                setFeedbacks(res.data);
            } catch (err) {
                console.error("Failed to fetch feedbacks:", err);
            }
        };

        fetchConsultants();
        fetchFeedbacks();
    }, []);

    const getAverageRating = (consultantId) => {
        const feedback = feedbacks.find(feedback => feedback._id === consultantId);
        return feedback ? feedback.averageRating.toFixed(1) : "0.0";
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

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
                <h1 className="text-6xl font-semibold bg-opacity-50 px-6 py-4 rounded-lg">
                    Câu chuyện của chúng tôi
                </h1>
            </div>

            {/* Body Section */}
            <div className="max-w-7xl mx-auto px-6 py-16 text-[#2B6A7C]">
                <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800"> {/* Adjusted margins */}
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

                <div className="max-w-7xl mx-auto px-6 py-16 text-[#2B6A7C]">
                    <div className="flex-shrink-0 text-[40px] mb-10 font-semibold leading-[48px] tracking-[-0.8px] text-center px-[80px] text-[#2B6A7C] pacifico-regular">
                        Top những sản phẩm nổi bật:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
                            >
                                {/* Product Image */}
                                <div className="w-full h-48 overflow-hidden cursor-pointer" onClick={() => handleImageClick(product.imgURL || "/images/default-product.png")}>
                                    <img
                                        src={product.imgURL || "/images/default-product.png"}
                                        alt={product.productName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="px-6 pt-6 flex-grow">
                                    <h3 className="text-xl font-semibold mb-2 cursor-pointer" onClick={() => handleProductClick(product._id)}>
                                        {product.productName}
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        {expandedProduct === product._id ? product.description : `${product.description.substring(0, 100)}...`}
                                        {product.description.length > 100 && (
                                            <button onClick={() => toggleExpand(product._id)} className="text-blue-500 ml-2">
                                                {expandedProduct === product._id ? "Thu gọn" : "Xem thêm"}
                                            </button>
                                        )}
                                    </p>
                                </div>
                                <div className="px-6 pb-6">
                                    <p className="text-lg font-bold text-[#2B6A7C] mb-4">
                                        {expandedProduct === product._id ? product.price.toLocaleString() : `${product.price.toLocaleString().substring(0, 10)}...`} VND
                                        {product.price.toLocaleString().length > 10 && (
                                            <button onClick={() => toggleExpand(product._id)} className="text-blue-500 ml-2">
                                                {expandedProduct === product._id ? "Thu gọn" : "Xem thêm"}
                                            </button>
                                        )}
                                    </p>
                                    <p
                                        className={`text-sm mb-4 ${product.availability ? "text-green-500" : "text-red-500"}`}
                                    >
                                        {expandedProduct === product._id ? (product.availability ? "Còn hàng" : "Hết hàng") : `${(product.availability ? "Còn hàng" : "Hết hàng").substring(0, 10)}...`}
                                        {(product.availability ? "Còn hàng" : "Hết hàng").length > 10 && (
                                            <button onClick={() => toggleExpand(product._id)} className="text-blue-500 ml-2">
                                                {expandedProduct === product._id ? "Thu gọn" : "Xem thêm"}
                                            </button>
                                        )}
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        className="w-full px-4 py-2 bg-[#A7DFEC] text-white rounded-full hover:bg-[#2B6A7C] transition duration-300"
                                        disabled={!product.availability}
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services Section */}
                <div className="max-w-7xl mx-auto px-6 py-16 text-[#2B6A7C]">
                    <div className="flex-shrink-0 text-[40px] mb-10 font-semibold leading-[48px] tracking-[-0.8px] text-center px-[80px] text-[#2B6A7C] pacifico-regular">
                        Những dịch vụ của chúng tôi:
                    </div>

                </div>

                {/* Consultants Section */}
                <div className="max-w-7xl mx-auto px-6 py-16 text-[#2B6A7C]">
                    <div className="flex-shrink-0 text-[40px] mb-10 font-semibold leading-[48px] tracking-[-0.8px] text-center px-[80px] text-[#2B6A7C] pacifico-regular">
                        Những chuyên viên của chúng tôi:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {consultants.map((consultant) => (
                            <div
                                key={consultant._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full"
                            >
                                {/* Consultant Image */}
                                <div className="w-full h-48 overflow-hidden cursor-pointer" onClick={() => handleConsultantImageClick(consultant.image || "/images/default-consultant.png")}>
                                    <img
                                        src={consultant.image || "/images/default-consultant.png"}
                                        alt={consultant.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Consultant Details */}
                                <div className="px-6 pt-6 pb-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold mb-2">
                                        {consultant.firstName} {consultant.lastName}
                                    </h3>
                                    <p className="text-gray-600 mb-4 flex-grow">
                                        {expandedConsultant === consultant._id ? consultant.note : `${consultant.note.substring(0, 100)}...`}
                                        {consultant.note.length > 100 && (
                                            <button onClick={() => toggleConsultantNote(consultant._id)} className="text-blue-500 ml-2">
                                                {expandedConsultant === consultant._id ? "Thu gọn" : "Xem thêm"}
                                            </button>
                                        )}
                                    </p>
                                    <div className="text-gray-600 mt-2">
                                        <h3 className="text-lg mt-5 mb-1 font-bold">Đánh giá của khách hàng</h3>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Footer */}
            <Footer />



            {/* Quantity Modal */}
            {showQuantityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Chọn số lượng sản phẩm
                        </h3>
                        <div className="flex justify-center items-center mb-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-l-lg hover:bg-gray-400 transition"
                                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                            >
                                -
                            </button>
                            <span className="px-4 py-2 bg-white text-gray-800 border border-gray-300">
                                {quantity}
                            </span>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-r-lg hover:bg-gray-400 transition"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                                onClick={() => setShowQuantityModal(false)}
                            >
                                Đóng
                            </button>
                            <button
                                className="py-2 px-6 bg-[#A7DFEC] text-white rounded-lg hover:bg-[#2B6A7C] transition"
                                onClick={handleAddToCart}
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* {cart.length > 0 && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleCheckout}
                        className="px-6 py-3 bg-[#A7DFEC] text-white rounded-full hover:bg-[#2B6A7C] transition duration-300"
                    >
                        Thanh toán
                    </button>
                </div>
            )} */}

            {/* Zoomed Image Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={closeZoomedImage}>
                    <img src={zoomedImage} alt="Zoomed" className="max-w-lg min-h-lg " />
                </div>
            )}
        </div>
    );
}


