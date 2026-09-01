const mongoose = require("mongoose");

const tokenCounterSchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true,
        unique: true,
    },
    seq: {
        type: Number,
        default: 100, 
    },
});

tokenCounterSchema.statics.getNextToken = async function () {
    const today = new Date().toISOString().slice(0, 10);
    const counter = await this.findOneAndUpdate(
        { date: today },
        { 
            $inc: { seq: 1 },
            $setOnInsert: { date: today }
        },
        { returnDocument: "after", upsert: true }
    );
    const tokenSeq = 100 + counter.seq;
    return `CR-${tokenSeq}`;
};

const TokenCounter = mongoose.model("TokenCounter", tokenCounterSchema);

module.exports = TokenCounter;
