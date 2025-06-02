import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const CommentModel = mongoose.model('Comment', commentSchema);

export default CommentModel;
