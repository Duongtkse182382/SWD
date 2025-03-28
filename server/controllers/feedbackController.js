const Feedback = require('../models/Feedback');
const BookingRequest = require('../models/BookingRequest')
const mongoose = require("mongoose");


exports.createFeedback = async (req, res) => {
  try {
    const { consultantRating, consultantComment, serviceRating, serviceComment, bookingRequestId } = req.body;

    console.log("Request Body:", req.body);

    // Kiểm tra booking request có tồn tại và hoàn thành chưa
    const bookingRequest = await BookingRequest.findById(bookingRequestId)
      .populate({ path: "serviceID", select: "_id" })  // Chỉnh đúng serviceID
      .populate({ path: "consultantID", select: "_id" });

    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    if (bookingRequest.status !== "Completed") {
      return res.status(400).json({ message: "Only completed bookings can receive feedback" });
    }

    const serviceId = bookingRequest.serviceID?._id; // Đúng với tên trường trong model BookingRequest
    const consultantId = bookingRequest.consultantID?._id;

    // Kiểm tra nếu không có rating thì không tạo feedback
    if (!consultantRating && !serviceRating) {
      return res.status(400).json({ message: "At least one rating is required" });
    }

    const feedback = new Feedback({
      bookingRequestId,
      serviceId,
      consultantId,
      serviceRating: serviceRating || null,
      serviceComment: serviceComment || "",
      consultantRating: consultantRating || null,
      consultantComment: consultantComment || "",
    });

    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating feedback", error });
  }
};


exports.getFeedbackByBooking = async (req, res) => {
  try {
    const feedback = await Feedback.find({ bookingRequestId: req.params.bookingRequestId });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("bookingRequestId", "customerId serviceId consultantId");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAverageServiceRating = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const objectId = new mongoose.Types.ObjectId(serviceId);

    const result = await Feedback.aggregate([
      {
        $match: { serviceId: objectId, serviceRating: { $exists: true } }
      },
      {
        $group: {
          _id: "$serviceId",
          averageRating: { $avg: "$serviceRating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(200).json([{ averageRating: 0, totalReviews: 0 }]);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAverageConsultantRating = async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $match: { consultantId: { $exists: true, $ne: null }, consultantRating: { $exists: true } }
      },
      {
        $group: {
          _id: "$consultantId",
          averageRating: { $avg: "$consultantRating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAverageConsultantRatingById = async (req, res) => {
  try {
    const consultantId = req.params.id;
    console.log("Consultant ID:", consultantId);

    const objectId = new mongoose.Types.ObjectId(consultantId);
    const result = await Feedback.aggregate([
      {
        $match: { consultantId: objectId, consultantRating: { $exists: true } }
      },
      {
        $group: {
          _id: "$consultantId",
          averageRating: { $avg: "$consultantRating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getFeedbackByService = async (req, res) => {
  try {
    const feedback = await Feedback.find({ serviceId: req.params.serviceId })
      .populate({
        path: "bookingRequestId",
        populate: { path: "customerID", select: "firstName lastName" } // Lấy thông tin khách hàng
      });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeedbackByConsultant = async (req, res) => {
  try {
    const feedback = await Feedback.find({ consultantId: req.params.consultantId })
      .populate({
        path: "bookingRequestId",
        populate: { path: "customerID", select: "firstName lastName avatar" } // Lấy thông tin khách hàng
      });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
