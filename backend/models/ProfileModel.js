import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  fieldOfStudy: {
    type: String,
    required: true,
  },
  years: {
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  }
});

const workSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,

  },
  years: {
    type: Number,
    required: true,
  },
});

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: {
      type: String,
    },
    currentPosition: {
      type: String,
    },
    pastWork: [workSchema],
    education: [educationSchema], 
  },
  {
    timestamps: true, 
  }
);

const ProfileModel = mongoose.model('Profile', profileSchema);

export default ProfileModel;
