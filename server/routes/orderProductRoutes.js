const express = require("express");
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getCustomerOrders,
  cancelOrder,
  getOrderById,
  getCartByCustomerId,
  checkoutOrder // Import the new function
} = require("../controllers/orderProductController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, authorize(["Customer"]), createOrder);
router.get("/", authenticate, authorize(["Staff"]), getAllOrders);
router.put("/:id/status", updateOrderStatus);
router.get("/my-orders", authenticate, authorize(["Customer"]), getCustomerOrders);
router.get("/history/customer", authenticate, authorize(["Customer"]), getCustomerOrders); // Correct route for customer order history
router.put("/:id/cancel", authenticate, authorize(["Customer"]), cancelOrder);
router.get("/cart", authenticate, authorize(["Customer"]), getCartByCustomerId); // Ensure this route is defined before routes with :id
router.get("/:id", authenticate, getOrderById);
router.post("/checkout", authenticate, authorize(["Customer"]), checkoutOrder); // Add the new route

module.exports = router;
