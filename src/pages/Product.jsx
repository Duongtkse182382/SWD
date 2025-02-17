import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const skincareRoutines = [
    {
        name: "Lộ trình chăm sóc da cơ bản",
        description: "Dành cho người mới bắt đầu với các bước cơ bản giúp duy trì làn da khỏe mạnh.",
        products: [
            { name: "Sữa rửa mặt dịu nhẹ", image: "/images/cleanser.png" },
            { name: "Toner cấp ẩm", image: "/images/toner.png" },
            { name: "Kem dưỡng ẩm", image: "/images/moisturizer.png" }
        ]
    },
    {
        name: "Lộ trình dưỡng trắng",
        description: "Tập trung vào làm sáng và đều màu da với các sản phẩm đặc trị.",
        products: [
            { name: "Serum vitamin C", image: "/images/serum.png" },
            { name: "Mặt nạ dưỡng trắng", image: "/images/mask.png" },
            { name: "Kem chống nắng", image: "/images/sunscreen.png" }
        ]
    },
    {
        name: "Lộ trình trị mụn",
        description: "Giúp giảm mụn và ngăn ngừa mụn tái phát với các sản phẩm chuyên dụng.",
        products: [
            { name: "Gel trị mụn", image: "/images/acne-gel.png" },
            { name: "Nước hoa hồng làm dịu da", image: "/images/rose-water.png" },
            { name: "Kem dưỡng phục hồi da", image: "/images/healing-cream.png" }
        ]
    }
];

export default function Product() {
    return (
        <div className="bg-[#F5F5F5] min-h-screen">
            <header className="bg-[#E5F5F1] shadow-md py-6 px-8 flex justify-between items-center">
                <h1 className="text-[#A7DFEC] text-2xl font-bold">SWD</h1>
                <nav className="flex space-x-20">
                    <Link to="/ve-chung-toi" className="text-[#2B6A7C] font-semibold hover:text-[#404040]">About</Link>
                    <Link to="/dich-vu" className="text-[#2B6A7C] font-semibold hover:text-[#404040]">Service</Link>
                    <Link to="#" className="text-[#2B6A7C] font-semibold hover:text-[#404040]">Skincare Consultation</Link>
                    <Link to="/san-pham" className="text-[#2B6A7C] font-semibold hover:text-[#404040]">Product</Link>
                    <Link to="/blog" className="text-[#2B6A7C] font-semibold hover:text-[#404040]">Blog</Link>
                </nav>
                <Link to="/dang-nhap">
                    <button className="bg-[#A7DFEC] text-white px-4 py-2 rounded-full hover:bg-[#2B6A7C]">Login</button>
                </Link>
            </header>

            <div className="h-[500px] w-full flex items-center justify-center text-white text-center"
                style={{
                    backgroundImage: "url('/images/service.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed"
                }}>
                <h1 className="text-5xl font-semibold bg-opacity-50 px-6 py-4 rounded-lg">Sản phẩm chăm sóc da</h1>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-16 text-[#2B6A7C]">
                {skincareRoutines.map((routine, index) => (
                    <div key={index} className="mb-12">
                        <h2 className="text-3xl font-bold text-center mb-4">{routine.name}</h2>
                        <p className="text-lg text-center leading-relaxed pb-4">{routine.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {routine.products.map((product, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#00000000]">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-semibold mt-3">{product.name}</h3>
                                    <button className="mt-3 px-7 py-1 bg-[#A7DFEC] text-white rounded-full hover:bg-[#2B6A7C]">Mua ngay</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="bg-[#E5F5F1] text-[#2B6A7C] py-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
                    <div>
                        <h3 className="text-lg font-bold">Let's Stay Social</h3>
                        <div className="flex space-x-4 mt-2">
                            <a href="#" className="hover:text-[#000000]"><FaFacebook size={24} /></a>
                            <a href="#" className="hover:text-[#000000]"><FaInstagram size={24} /></a>
                            <a href="#" className="hover:text-[#000000]"><FaTwitter size={24} /></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[#2B6A7C] text-lg font-bold">About</h3>
                        <ul className="mt-2 space-y-1">
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">Our Story</a></li>
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">Mission</a></li>
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">Sustainability</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[#2B6A7C] text-lg font-bold">Support</h3>
                        <ul className="mt-2 space-y-1">
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">Contact Us</a></li>
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">FAQ</a></li>
                            <li><a href="#" className="text-[#2B6A7C] hover:text-[#000000]">Shipping & Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[#2B6A7C] text-lg font-bold">Legal</h3>
                        <ul className="mt-2 space-y-1">
                            <li><a href="#" className="text-[#2B6A7C] hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-[#2B6A7C] hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-8 text-[#2B6A7C] text-sm">
                    &copy; 2025 SWD. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
