import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    state_accepted: {
      type: Boolean,
      default: null, 
    },
  },
  {
    timestamps: true,
  }
);

const ConnectionModel = mongoose.model('Connection', connectionSchema);

export default ConnectionModel;
