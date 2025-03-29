import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from '../utils/axiosInstance';

const Navbar = ({ cart, setCart }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
    const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem("authToken")) || sessionStorage.getItem("authToken");
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showModal]);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCart(updatedCart);
        };
        window.addEventListener("storage", handleStorageChange); // Correct event listener
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [setCart]);

    useEffect(() => {
        if (cart && typeof cart === 'object') {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart]);

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
        }
    }, [token]);

    const isLoginPage = ["/dang-nhap", "/dang-ky", "/customer-profile", "/forgot-password"].includes(location.pathname);

    const handleLogout = () => {
        if (!showModal) return;
        axios.post("/api/auth/logout")
            .then(() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("roleName");
                localStorage.removeItem("fullName");
                localStorage.removeItem("userId");
                localStorage.removeItem("orderID"); // Clear orderID on logout
                localStorage.removeItem("cart"); // Clear cart on logout
                sessionStorage.removeItem("authToken");
                sessionStorage.removeItem("roleName");
                sessionStorage.removeItem("fullName");
                sessionStorage.removeItem("userId");
                navigate("/dang-nhap");
            })
            .catch(error => {
                console.error("Logout failed:", error.response?.data?.message || error.message);
            });
    };

    const handleQuantityChange = (index, newQuantity) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    return (
        <div className="w-full h-[80px] bg-[#E5F5F1] flex items-center justify-between px-6 md:px-12 lg:px-10 shadow-md relative z-10">
            <NavLink to="/" className="w-[200px] h-[70px] flex items-center">
                <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </NavLink>

            <button
                className="md:hidden text-[#2B6A7C] text-[30px] z-20"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                ☰
            </button>

            <nav
                className={`absolute top-[80px] left-0 w-full bg-[#E5F5F1] flex flex-col items-center pacifico-regular gap-4 p-6 shadow-lg rounded-md transition-transform duration-300 md:static md:w-auto md:p-0 md:flex-row md:shadow-none md:gap-20 ${isMobileMenuOpen ? "flex" : "hidden md:flex"}`}
            >
                {["Chúng tôi", "Dịch vụ", "Sản phẩm", "Chuyên viên tư vấn", "Blog", "Kiểm tra kiểu da"].map((item) => (
                    <NavLink
                        key={item}
                        to={`/${item.toLowerCase()}`}
                        className={({ isActive }) =>
                            `text-center text-[20px] font-semibold transition-colors ${isActive ? "text-[#A7DFEC]" : "text-[#2B6A7C] hover:text-[#A7DFEC]"}`
                        }
                    >
                        {item}
                    </NavLink>
                ))}
            </nav>

            {!isLoginPage && (
                <div className="relative flex items-center gap-6">
                    {token && (
                        <button onClick={() => navigate("/product-detail")} className="relative">
                            <i className="fa-solid fa-cart-shopping text-[#2B6A7C] text-[30px]"></i>
                            {cart?.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    )}

                    {token ? (
                        <button onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}>
                            <i className="fas fa-user text-[#2B6A7C] text-[30px]"></i>
                        </button>
                    ) : (
                        <NavLink to="/dang-nhap" className="hidden md:block bg-[#A7DFEC] text-white text-[18px] px-4 py-2 rounded-full shadow-sm hover:opacity-80">
                            Đăng nhập
                        </NavLink>
                    )}

                    {isProfilePopupOpen && token && (
                        <div className="absolute right-0 top-8 mt-o w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 ">
                            <div className="block px-4 py-2 text-gray-800">
                                Chào mừng, {fullName}
                            </div>
                            <NavLink to="/thong-tin-ca-nhan" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                Thông tin cá nhân
                            </NavLink>
                            <button onClick={() => setShowModal(true)} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            )}
            {/* Custom Logout Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận đăng xuất</h3>
                        <p className="text-gray-600">Bạn có muốn đăng xuất không?</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                                onClick={() => setShowModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="py-2 px-6 bg-[#A7DFEC] text-white rounded-lg hover:bg-[#2B6A7C] transition"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;