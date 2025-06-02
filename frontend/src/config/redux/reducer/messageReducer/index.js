import { createSlice } from '@reduxjs/toolkit';
import { sendMessage, getMessages, deleteMessage, deleteAllMessages } from '../../action/messageAction';

const initialState = {
  messages: [],
  isLoading: false,
  isError: false,
  errorMessage: '',
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    resetMessageState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      //get Messages
     .addCase(getMessages.pending, (state) => {
        state.isLoadingoading = true;
        state.isError = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload; 
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.filter(
          (message) => message._id !== action.payload._id
        );
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      //deleteAll messages
      .addCase(deleteAllMessages.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(deleteAllMessages.fulfilled, (state) => {
        state.isLoading = false;
        state.messages = [];
        state.unreadMessages = [];
      })
      .addCase(deleteAllMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { resetMessageState } = messageSlice.actions;
export default messageSlice.reducer;