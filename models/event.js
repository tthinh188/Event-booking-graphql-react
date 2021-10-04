const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    id: String,
    title: String,
    price: Number,
    date: Date
});