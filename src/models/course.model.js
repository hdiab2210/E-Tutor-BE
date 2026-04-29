const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },

    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },

    tools: [String], // ['React', 'Node.js', 'Figma']

    rating: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);