const OrderProduct = require("../models/OrderProduct");
const OrderItem = require("../models/OrderItem");
const mongoose = require("mongoose");

// Tạo đơn hàng sản phẩm
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Kiểm tra xem có đơn hàng nào đang ở trạng thái Pending không
    let order = await OrderProduct.findOne({ customerID: req.user.id, status: "Pending" });

    if (!order) {
      // Nếu không có, tạo đơn hàng mới
      order = new OrderProduct({ customerID: req.user.id, status: "Pending" });
      await order.save();
    }

    // Tạo các order item
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const orderItem = new OrderItem({
          orderID: order._id,
          productID: item.productID,
          quantity: item.quantity
        });
        return await orderItem.save();
      })
    );

    // Cập nhật orderItems trong OrderProduct
    order.orderItems.push(...orderItems.map(item => item._id));
    await order.save();

    res.status(201).json({ order, items: orderItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderProduct.find()
      .populate("customerID", "firstName lastName email");

    const results = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ orderID: order._id })
        .populate("productID", "productName price"); // Ensure productID is populated with correct fields
      return { ...order.toObject(), items }; // Combine order and its items
    }));

    res.status(200).json(results); // Return the combined results
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// 🔹 Cập nhật trạng thái đơn hàng

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    console.log("Received request to update order status", { id, status });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn("Invalid ID format", id);
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const validTransitions = {
      "Pending": ["Confirmed", "Cancelled", "Completed"],
      "Confirmed": ["Cancelled", "Completed"],
      "Cancelled": [],
      "Completed": []
    };

    const order = await OrderProduct.findById(id);
    if (!order) {
      console.warn("Order not found with ID", id);
      return res.status(404).json({ message: "Order not found" });
    }

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      console.warn(`Invalid status transition from '${order.status}' to '${status}'`);
      return res.status(400).json({ message: `Invalid status transition from '${order.status}' to '${status}'` });
    }

    order.status = status;
    await order.save();

    console.log("Order status updated successfully", order);

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};




// 🔹 Lấy danh sách đơn hàng của khách hàng
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await OrderProduct.find({ customerID: req.user.id });

    const results = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ orderID: order._id })
        .populate({
          path: "productID", // Ensure productID is populated
          select: "productName", // Only select productName
        });
      return { ...order.toObject(), productItems: items }; // Rename items to productItems for consistency
    }));

    res.json({ orders: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



// 🔹 Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const order = await OrderProduct.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customerID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own order" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only 'Pending' orders can be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await OrderProduct.findById(req.params.id)
      .populate("customerID", "firstName lastName email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderItem.find({ orderID: order._id })
      .populate("productID", "productName price");

    res.status(200).json({ ...order.toObject(), items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy giỏ hàng dựa trên customer ID
exports.getCartByCustomerId = async (req, res) => {
  try {
    const customerID = req.user.id;
    const order = await OrderProduct.findOne({ customerID, status: "Pending" })
      .populate("customerID", "firstName lastName email");

    if (!order) return res.status(404).json({ message: "Cart not found" });

    const items = await OrderItem.find({ orderID: order._id })
      .populate("productID", "productName price imgURL description availability");

    res.status(200).json({ ...order.toObject(), items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkoutOrder = async (req, res) => {
  try {
    const customerID = req.user.id;
    const order = await OrderProduct.findOne({ customerID, status: "Pending" });

    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Validate the cart and remove references to deleted products
    const validItems = await OrderItem.find({ orderID: order._id }).populate("productID");
    const validItemIds = validItems.map(item => item._id.toString());

    order.orderItems = order.orderItems.filter(itemId => validItemIds.includes(itemId.toString()));
    await order.save();

    order.status = "Confirmed";
    await order.save();

    res.status(200).json({ message: "Order confirmed successfully", order });
  } catch (error) {
    console.error("Checkout failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

