const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: {
        type: String
    },
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

// Course schema indexes

courseSchema.index({
    title: "text",
    description: "text"
}); // full-text search

courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ tools: 1 });

courseSchema.index({ createdAt: -1 });
courseSchema.index({ price: 1 });

// optimized compound index (very important)
courseSchema.index({
    category: 1,
    createdAt: -1
});

module.exports = mongoose.model('Course', courseSchema);