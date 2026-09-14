const express = require('express');
const router = express.Router();
const {
  getMyJobs,
  updateJobStatus
} = require('../controllers/mechanicController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('mechanic', 'admin'));

router.get('/jobs', getMyJobs);
router.put('/jobs/:id/status', updateJobStatus);

module.exports = router;
