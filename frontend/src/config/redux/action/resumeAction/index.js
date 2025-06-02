import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createResume = createAsyncThunk(
    "resume/create",
    async (data, thunkAPI) =>  {
        try{
            const response = await clientServer.post("/create", data,{
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            return response.data;
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const getResume = createAsyncThunk(
  "resume/get",
  async (id,thunkAPI) => {
    try {
      const response = await clientServer.get(`/getResume/${id}`);
      //console.log('Resume response:', response.data);
      //console.log(response);
      return response.data.resume;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);


export const deleteResume = createAsyncThunk(
  "resume/delete",
  async (id, thunkAPI) => {
    try {
      await clientServer.delete(`/deleteResume/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// resumeAction.js
export const downloadResume = createAsyncThunk(
  "resume/download",
  async ({ id, type }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await clientServer.get(`/downloadResume/${id}?type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to download resume",
      });
    }
  }
);


