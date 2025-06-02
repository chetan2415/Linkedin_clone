import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    likes: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
    }],
    replyToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true,
    },
    text:{
      type:String,
      required:true,
    },
    likes: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
    }],
    replies: [replySchema]
  },
  {timestamps: true}
);
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    likes:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      default:[],
    }],
    media: [{
      type: String, 
      default:'',
    }],
    fileType: [{
      type: String,
    }],
    active: {
      type: Boolean,
      default: true, 
    },
    comments: [commentSchema],
  },
  {
    timestamps: true, 
  }
);

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
