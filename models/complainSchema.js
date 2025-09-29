// models/complainSchema.js
const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    }
});

module.exports = mongoose.model("complain", complainSchema);