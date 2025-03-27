// import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import LoginPage from "../pages/guest/LoginPage.jsx";
import RegisterPage from "../pages/guest/RegisterPage.jsx";
import SkincareConsultation from "../pages/guest/Skinconsultation.jsx";
import Services from "../pages/guest/Services.jsx";
import MyCalendar from "../pages/customer/Calendar.jsx";
import About from "../pages/guest/About.jsx";
import Blog from "../pages/guest/Blog.jsx";
import ForgotPassword from "../pages/guest/Forgotpassword.jsx";
import VerifyEmailPage from "../pages/guest/VerifyEmailPage.jsx";
import ServiceManagement from "../pages/manager/ServiceManagement.jsx";
import StaffManagement from "../pages/manager/StaffManagement.jsx";
import Dashboard from "../pages/manager/Dashboard.jsx";
import TherapistManagement from "../pages/manager/TherapistManagement.jsx";
import BlogManagement from "../pages/manager/BlogManagement.jsx";
import QuestionManagement from "../pages/manager/QuestionManagement.jsx";
import ProductManagement from "../pages/manager/ProductManagement.jsx";
import ViewBooking from "../pages/staff/ViewBooking.jsx";
import ViewOrder from "../pages/staff/ViewOrder.jsx";
import ChangePassword from "../components/ChangePassword.jsx";
import BlogDetail from "../pages/guest/BlogDetail.jsx";
import ServiceDetails from "../pages/guest/ServiceDetails.jsx";
import BookingTherapist from "../pages/customer/BookingTherapist.jsx";
import CustomerProfile from "../pages/customer/ProfileUpdate.jsx";
import { PaySuccess } from "../pages/staff/PaySuccess";
import { PayFailed } from "../pages/staff/PayFailed";
import Product from "../pages/guest/Product.jsx";
import ViewBookingHistory from "../pages/customer/ViewBookingHistory.jsx";
import Quiz from "../pages/customer/Quiz.jsx";
import ProductDetail from "../pages/guest/ProductDetail.jsx";
import Errorpage from "../pages/guest/Errorpage.jsx";
import BookingProductsHistory from "../pages/customer/BookingProductsHistory.jsx";
import { AnimatePresence, motion } from "framer-motion";
import ViewBooked from "../pages/consultant/ViewBooked.jsx";
import { PaySuccessOrder } from "../pages/customer/PaySuccessOrder.jsx";
import { PayFailedOrder } from "../pages/customer/PayFailedOrder.jsx";
import ResetPassword from "../pages/guest/Resetpassword.jsx";


axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
};



function AppRoute() {
  const userRole = localStorage.getItem("roleName"); // Get user role
  const location = useLocation();

  // Define default pages for each role
  const roleRoutes = {
    Guest: "/chúng tôi",
    Customer: "/chúng tôi",
    Manager: "/dashboard",
    Staff: "/view-booking",
  };

  // Default page based on role
  const defaultPage = roleRoutes[userRole] || "/chúng tôi";



  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          style={{ position: "relative" }}
        >

          <Routes location={location} key={location.pathname}>
            {/* Root path redirects based on role */}
            <Route path="/" element={<Navigate to={defaultPage} replace />} />

            {/* Public Pages */}
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="/dang-ky" element={<RegisterPage />} />
            <Route path="/quen-mat-khau" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/xac-nhan-email" element={<VerifyEmailPage />} />

            {/* Guest & Customer Shared Pages */}
            <Route element={<ProtectedRoute allowedRoles={["Guest", "Customer"]} />}>
              <Route path="/chúng tôi" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/dịch vụ" element={<Services />} />
              <Route path="/dịch vụ/:id" element={<ServiceDetails />} />
              <Route path="/chuyên viên tư vấn" element={<SkincareConsultation />} />
              <Route path="/sản phẩm" element={<Product />} />
              <Route path="/kiểm tra kiểu da" element={<Quiz />} />
              <Route path="/product-detail" element={<ProductDetail />} />
            </Route>

            {/* Customer Pages */}
            <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
              {/* <Route path="/booking" element={<BookingPageCustomer />} /> */}
              <Route path="/lich-hen" element={<MyCalendar />} />
              <Route path="/chon-chuyen-vien" element={<BookingTherapist />} />
              <Route path="/dịch vụ/:id/chon-chuyen-vien" element={<BookingTherapist />} />
              <Route path="/dịch vụ/:id/chon-chuyen-vien/:idConsultant/lich-hen" element={<MyCalendar />} />
              <Route path="/thong-tin-ca-nhan" element={<CustomerProfile />} />
              <Route path="/lich-su-dat-lich" element={<ViewBookingHistory />} />
              <Route path="/lich-su-dat-hang" element={<BookingProductsHistory />} />
              <Route path="/pay-success-order" element={<PaySuccessOrder />} />
              <Route path="/pay-failed-order" element={<PayFailedOrder />} />
            </Route>

            {/* Manager Pages */}
            <Route element={<ProtectedRoute allowedRoles={["Manager"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/service-management" element={<ServiceManagement />} />
              <Route path="/blog-management" element={<BlogManagement />} />
              <Route path="/question-management" element={<QuestionManagement />} />
              <Route path="/staff-management" element={<StaffManagement />} />
              <Route path="/therapist-management" element={<TherapistManagement />} />
              <Route path="/product-management" element={<ProductManagement />} />
            </Route>



            {/* Company Shared Pages */}
            <Route element={<ProtectedRoute allowedRoles={["Manager", "Staff", "Consultant"]} />}>
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Staff Pages */}
            <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
              <Route path="/view-booking" element={<ViewBooking />} />
              <Route path="/view-order" element={<ViewOrder />} />
              <Route path="/pay-success" element={<PaySuccess />} />
              <Route path="/pay-failed" element={<PayFailed />} />
            </Route>


            <Route element={<ProtectedRoute allowedRoles={["Consultant"]} />}>
              <Route path="/view-booked" element={<ViewBooked />} />
            </Route>


            {/* 404 Fallback */}
            <Route path="*" element={<Errorpage />} />
          </Routes>

        </motion.div>
      </AnimatePresence>


    </div>
  );
}

export default AppRoute;