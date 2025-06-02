// config/redux/slice/resumeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createResume,
  getResume,
  deleteResume,
  downloadResume,
} from "../../action/resumeAction";

const initialState = {
  resumes: [],
  currentResume: null,
  isLoading: false,
  isError: false,
  errorMessage: "",
  successMessage: "",
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    clearMessages(state) {
      state.successMessage = "";
      state.errorMessage = "";
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createResume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes.push(action.payload);
        state.currentResume = action.payload;
        state.successMessage = "Resume created successfully";
      })
      .addCase(createResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // GET
      .addCase(getResume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResume = action.payload;
      })
      .addCase(getResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // DELETE
      .addCase(deleteResume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumes = state.resumes.filter((r) => r._id !== action.payload);
        if (state.currentResume?._id === action.payload) {
          state.currentResume = null;
        }
        state.successMessage = "Resume deleted successfully";
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // DOWNLOAD
      .addCase(downloadResume.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(downloadResume.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = "Resume downloaded successfully";
      })
      .addCase(downloadResume.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || action.payload || "unkown error";
      });
  },
});

export const { clearMessages } = resumeSlice.actions;
export default resumeSlice.reducer;
