import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      lowercase: true, 
    },
    profilePicture: {
      type: String,
      default: 'default.jpg', 
      select:true,
    },
    backgroundImage: {
      type: String,
      default: 'default.jpg', 
    },
    
    password: { 
      type: String, 
      required: true 
    },
  },
  {
    timestamps: true, 
  }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
