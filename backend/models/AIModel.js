import mongoose from 'mongoose';

const inputSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, 
});

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    inputs: [inputSchema],
}, {
    timestamps: true, 
});

const ChatSession = mongoose.model('chatSession', chatSessionSchema);
export default ChatSession;
