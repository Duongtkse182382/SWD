import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, Button, Box } from "@mui/material";
import axios from "axios";

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const [showModal, setShowModal] = useState(false);

  const menuItems = [
    { name: "Chi tiết tài khoản", path: "/thong-tin-ca-nhan" },
    { name: "Lịch sử đặt lịch", path: "/lich-su-dat-lich" },
    { name: "Lịch sử đặt hàng", path: "/lich-su-dat-hang" },
  ];

  const handleLogout = () => {
    axios.post("/api/auth/logout")
      .then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");
        navigate("/dang-nhap");
      })
      .catch(error => {
        console.error("Đăng xuất thất bại:", error.response?.data?.message || error.message);
      })
      .finally(() => setShowModal(false));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 260,
          backgroundColor: "#f9faef",
          color: "#A7DFEC",
          padding: "10px",
        },
      }}
    >
      <Toolbar sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            backgroundImage: `url(https://www.pngplay.com/wp-content/uploads/7/Customer-Logo-Transparent-File.png)`,
            backgroundSize: "cover",
            borderRadius: "50%",
            marginBottom: 2,
          }}
        />
        <Typography variant="h6" sx={{ color: "#2B6A7C", textAlign: "center" }}>
          Chào mừng, <br /> {fullName}
        </Typography>
      </Toolbar>
      <Divider sx={{ backgroundColor: "#2B6A7C" }} />

      <List>
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton selected={location.pathname === item.path} sx={{ "&.Mui-selected": { backgroundColor: "#2B6A7C", color: "white" } }}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>

      <Button
        onClick={() => setShowModal(true)}
        sx={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          backgroundColor: "#2B6A7C",
          color: "white",
          "&:hover": {
            backgroundColor: "#A7DFEC",
          },
          fontSize: "14px",
        }}
      >
        Đăng xuất
      </Button>

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
                className="py-2 px-6 bg-[#2B6A7C] text-white rounded-lg hover:bg-[#A7DFEC] transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CustomerSidebar;