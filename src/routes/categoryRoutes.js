const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
const isAuth = require('../middleware/is-auth');


router.get('/', isAuth, categoryController.getCategories);
router.post('/', isAuth, categoryController.createCategory);

module.exports = router;