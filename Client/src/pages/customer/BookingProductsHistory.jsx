import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import CustomerSidebar from "../../components/CustomerSidebar";
import {
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    TableContainer,
    Typography,
    TablePagination,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Fab } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

const OrderProductsHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();

    const fetchOrdersByCustomer = async () => {
        try {
            console.log("Fetching orders from /api/orders/history/customer...");
            const response = await axios.get("/api/orders/history/customer"); // Ensure this matches the backend route
            console.log("API Response:", response.data);
            if (response.status === 200 && response.data.orders.length > 0) {
                setOrders(response.data.orders);
            } else {
                setOrders([]);
                setError("Không tìm thấy đơn hàng nào.");
            }
        } catch (err) {
            console.error("Error fetching orders:", err.response?.data || err.message);
            if (err.response?.status === 404) {
                setError("Không tìm thấy đơn hàng nào.");
            } else {
                setError(err.response?.data?.message || "Đã xảy ra lỗi khi lấy dữ liệu.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdersByCustomer();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="flex main-container w-full h-full bg-gray-100 relative mx-auto my-0 p-6">
            <CustomerSidebar />
            <div className="w-full">
                <Typography variant="h4" className="mb-4 text-[#2B6A7C] text-center">
                    Lịch sử đơn hàng
                </Typography>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <CircularProgress />
                    </div>
                ) : error ? (
                    <Typography color="error" className="text-center">{error}</Typography>
                ) : orders.length === 0 ? (
                    <Typography className="text-center">Không có đơn hàng nào.</Typography>
                ) : (
                    <>
                        <TableContainer component={Paper} elevation={3} className="shadow-md">
                            <Table>
                                <TableHead className="bg-[#A7DFEC] text-white">
                                    <TableRow>
                                        <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#444444' }}>Mã đơn</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#444444' }}>Sản phẩm</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#444444' }}>Tổng giá</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#444444' }}>Ngày tạo</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#444444' }}>Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedOrders.map((order) => (
                                        <TableRow key={order._id} className="transition duration-300 hover:bg-gray-100">
                                            <TableCell align="center">{order._id}</TableCell>
                                            <TableCell align="center">
                                                {order.productItems && order.productItems.length > 0
                                                    ? order.productItems.map((item) => item.productID.productName).join(", ") // Access productName from productID
                                                    : "Không có sản phẩm"}
                                            </TableCell>
                                            <TableCell align="center">{order.totalPrice} VND</TableCell>
                                            <TableCell align="center">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell align="center">
                                                <span
                                                    className={`p-1 rounded ${
                                                        order.status === "Pending"
                                                            ? "bg-yellow-200"
                                                            : order.status === "Completed"
                                                            ? "bg-green-200"
                                                            : "bg-red-200"
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={orders.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
                <Fab
                    color="primary"
                    onClick={() => navigate("/")}
                    sx={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        backgroundColor: "#2B6A7C",
                        "&:hover": { backgroundColor: "#A7DFEC" },
                    }}
                >
                    <HomeIcon />
                </Fab>
            </div>
        </div>
    );
};

export default OrderProductsHistory;