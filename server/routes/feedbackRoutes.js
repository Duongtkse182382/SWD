const express = require('express');
const {
    createFeedback,
    getFeedbackByBooking,
    getAverageServiceRating,
    getAverageConsultantRating,
    getFeedbackByService,
    getAverageConsultantRatingById,
    getFeedbackByConsultant,
} = require('../controllers/feedbackController');
const { authenticate } = require('../middlewares/authMiddleware'); // Require authentication

const router = express.Router();

router.get('/service-rating/:serviceId', getAverageServiceRating);
// Lấy rating trung bình của dịch vụ
router.get('/consultant-rating/:id', getAverageConsultantRatingById); // Lấy rating trung bình của tư vấn viên id
router.get('/consultant-rating', getAverageConsultantRating); // Lấy rating trung bình của tư vấn viên
router.post('/', createFeedback); // Require authentication to create feedback
router.get('/:bookingRequestId', getFeedbackByBooking); // Secure route
router.get('/service/:serviceId', getFeedbackByService);
router.get('/consultant/:consultantId', getFeedbackByConsultant); // Lấy bình luận của khách hàng dành cho chuyên viên

module.exports = router;