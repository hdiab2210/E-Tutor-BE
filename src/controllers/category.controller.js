const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const category = new Category({ name });
        await category.save();
        res.status(201).json({
            message: 'Category created',
            data: category
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}