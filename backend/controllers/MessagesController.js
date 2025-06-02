import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from "../models/UserModel.js"; 
import Message from '../models/Messages.js';

export const SendMessage = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    try {
        if (!token) {
            return res.status(401).json({ message: "Token missing or invalid" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.TOKEN_KEY);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const { receiverId, message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "Message content cannot be empty" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        const newMessage = new Message({
            senderId: decoded.userId,
            receiverId,
            message,
            isRead: false,
        });

        await newMessage.save();
        console.log("Message sent:", newMessage);
        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error in SendMessage:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    //console.log("Decoded User ID:", decoded.userId);
    //console.log("Other User ID:", otherUserId);

    const messages = await Message.find({
      $or: [
        { senderId: decoded.userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: decoded.userId },
      ],
    }).sort({ createdAt: 1 });

    console.log("Messages Found:", messages);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const DeleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const DeleteAllMessages = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        if (!token) {
            return res.status(401).json({ message: "Token missing or invalid" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.TOKEN_KEY);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const user = await User.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete all messages where the user is either the sender or receiver
        await Message.deleteMany({
            $or: [
                { senderId: decoded.userId },
                { receiverId: decoded.userId },
            ],
        });

        res.status(200).json({ message: 'All messages deleted successfully' });
    } catch (error) {
        console.error("Error in DeleteAllMessages:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};