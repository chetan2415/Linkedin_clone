import PostModel from "../models/PostModel.js"; 
import User from "../models/UserModel.js";
import Profile from "../models/ProfileModel.js";
import jwt from "jsonwebtoken"; 
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow posts with or without files
    const allowedFileTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'text/plain',
      'audio/mpeg', 'audio/mp3', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'
    ];

    let media = [];
    let fileType = [];

    if (req.files && req.files.length > 0) {
      // Validate all files
      for (const file of req.files) {
        if (!allowedFileTypes.includes(file.mimetype)) {
          return res.status(400).json({
            message: `Invalid file type: ${file.mimetype}. Allowed: ${allowedFileTypes.join(", ")}`
          });
        }
      }
      media = req.files.map(file => file.filename);
      fileType = req.files.map(file => file.mimetype);
    }

    const post = new PostModel({
      userId: user._id,
      body: req.body.body,
      media,
      fileType,
      active: true,
    });

    await post.save();
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
  
export const getAllPosts = async (req, res) => {
    try{
        const posts = await PostModel.find().populate('userId', 'name username email profilePicture')
        .populate({
          path: 'comments.userId',
          select: 'username profilePicture'
        })
        .populate({
          path: 'comments.replies.userId',
          select: 'username profilePicture'
        }).sort({createdAt: -1});
        res.status(200).json({post: posts});

    }catch(error){
        return res.status(500).json({message: error.message});
    }
};

export const deletePost = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is missing" });
        }

        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
        const userId = decodedToken.userId; 

        const { id } = req.params;

        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        await PostModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const commentPost = async (req, res) => {

    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token is missing" });
        }

        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
        const userId = decodedToken.userId;

        const { postId, text } = req.body; 
        console.log("Received comment:", req.body);

        if (!text || text.trim() === "") {
          return res.status(400).json({ message: "Comment text is required" });
        }
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
      
        // Create a new comment
        const newComment = {
            userId,
            text: text,
            likes: [],
        };

        post.comments.push(newComment);
        await post.save();

        return res.status(201).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getCommentsByPost = async (req, res) => {
    try {
        let { postId } = req.query;
    
        //console.log("Requested postId:", postId);
        postId = postId.trim().replace(/\.$/, '');
        const post = await PostModel.findById(postId)
        .populate({
          path: 'comments.userId',
          select: 'name username email profilePicture' 
        })
        .populate({
          path: 'comments.replies.userId', 
          select: 'name username email profilePicture' 
        })
        .lean()
        .exec();
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

        return res.status(200).json({ comments: post.comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;  
    const { postId } = req.query; 
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own comments" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const likes = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { type } = req.body;

    console.log("Incoming request:", { postId, type, commentId, replyId });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: Token missing" });

    const decoded = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decoded.userId;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let likedArray;

    if (type === "post") {
      likedArray = post.likes;
    } 
    else if (type === "comment") {
      const comment = post.comments.find(c => c._id.toString() === commentId);

      if (!comment) return res.status(404).json({ message: "Comment not found" });
      likedArray = comment.likes;
    } 
    else if (type === "reply") {
      const comment = post.comments.find(c => c._id.toString() === commentId);

      if (!comment) return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.find(r => r._id.toString() === replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });
      likedArray = reply.likes;
    } 
    else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const index = likedArray.findIndex(id => id.toString() === userId);

    if (index === -1) {
      likedArray.push(userId);
    } else {
      likedArray.splice(index, 1);
    }

    await post.save();

    return res.status(200).json({
      message: `${type} like toggled successfully`,
      likesCount: likedArray.length,
      likedUsers: likedArray,
      postId: post._id,
      commentId,
      replyId,
      type,
    });

  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const addReply = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text, replyToUserId } = req.body;

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: Token is missing" });

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;
    console.log(decodedToken);

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = { text, userId, replyToUserId };
    comment.replies.push(newReply);
    await post.save();

    const addedReply = comment.replies[comment.replies.length - 1];
    res.status(200).json({ reply: addedReply });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: Token is missing" });

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own replies" });
    }

    comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
    await post.save();

    return res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};