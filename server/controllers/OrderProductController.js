const OrderProduct = require("../models/OrderProduct");
const OrderItem = require("../models/OrderItem");

// Tạo đơn hàng sản phẩm
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Tạo đơn hàng chính
    const newOrder = new OrderProduct({ customerID: req.user.id, status: "Pending" });
    const savedOrder = await newOrder.save();

    // Tạo các order item
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const orderItem = new OrderItem({
          orderID: savedOrder._id,
          productID: item.productID,
          quantity: item.quantity
        });
        return await orderItem.save();
      })
    );

    res.status(201).json({ order: savedOrder, items: orderItems });
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
        .populate("productID", "name price");
      return { ...order.toObject(), items };
    }));

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔹 Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validTransitions = {
      "Pending": ["Confirmed", "Cancelled"],
      "Confirmed": ["Cancelled"]
    };

    const order = await OrderProduct.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ message: `Invalid status transition from '${order.status}' to '${status}'` });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// 🔹 Lấy danh sách đơn hàng của khách hàng
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await OrderProduct.find({ customerID: req.user.id });

    const results = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ orderID: order._id })
        .populate("productID", "name price");
      return { ...order.toObject(), items };
    }));

    res.json({ orders: results });
  } catch (error) {
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
      .populate("productID", "name price");

    res.status(200).json({ ...order.toObject(), items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

