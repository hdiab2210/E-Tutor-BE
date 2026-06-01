const Course = require('../models/course.model');

exports.getCourses = async (req, res) => {
    try {
        let {
            search,
            category,
            level,
            tools,
            sort,
            page = 1,
            limit = 9
        } = req.query;

        let query = {};

        //  Search (title + description)
        if (search) {
            query.$text = { $search: `"${search}"` };
        }

        //  Filters
        if (category) {
            query.category = { $in: category.split(',') };
        }

        if (level) {
            query.level = { $in: level.split(',') };
        }

        if (tools) {
            query.tools = { $in: tools.split(',') };
        }

        // Sorting
        let sortOption = {};

        switch (sort) {
            case 'price_asc':
                sortOption.price = 1;
                break;
            case 'price_desc':
                sortOption.price = -1;
                break;
            case 'title_asc':
                sortOption.title = 1;
                break;
            case 'newest':
            default:
                sortOption.createdAt = -1;
        }

        //  Pagination
        const skip = (page - 1) * limit;

        const courses = await Course.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit)).populate('category');

        const total = await Course.countDocuments(query);

        res.json({
            data: courses,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(10);

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBestSellingCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ studentsCount: -1 }) // highest first
            .limit(10);

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            level,
            tools
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const course = new Course({
            title,
            description,
            price,
            category,
            level,
            tools: tools ? tools.split(',') : [],
            image: `/uploads/${req.file.filename}`
        });

        await course.save();

        res.status(201).json({
            message: 'Course created',
            data: course
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
