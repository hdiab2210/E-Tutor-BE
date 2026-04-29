const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const upload = require('../middleware/upload');
const isAuth = require('../middleware/is-auth');

router.get('/', isAuth, courseController.getCourses);
router.post('/', isAuth, upload.single('image'), courseController.createCourse);
router.get('/recent', isAuth, courseController.getRecentCourses);
router.get('/best-selling', isAuth, courseController.getBestSellingCourses);


module.exports = router;