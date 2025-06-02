import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Send a message
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async ({ receiverId, message }, { rejectWithValue }) => {
    try {
      const response = await clientServer.post('/SendMessage', { receiverId, message }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch messages between the current user and another user
export const getMessages = createAsyncThunk(
  'message/getMessages',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await clientServer.get(`/getMessages/${otherUserId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data; // Return the messages array
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await clientServer.delete(`/DeleteMessage/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete all messages
export const deleteAllMessages = createAsyncThunk(
  'message/deleteAllMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await clientServer.delete(`/DeleteAllMessages/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);