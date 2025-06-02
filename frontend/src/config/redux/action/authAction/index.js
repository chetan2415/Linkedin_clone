import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';

///user login and register///
export const loginUser = createAsyncThunk(
  "user/login",
  async (userAgent, thunkAPI) => {
    const {email, password} = userAgent;
      try {
          const response = await clientServer.post("/login", {
              email,
              password
          });
          
          if (response.data.token && response.data.user?.userId) {
              localStorage.setItem("token", response.data.token);
              localStorage.setItem("user", JSON.stringify(response.data.user));
              return thunkAPI.fulfillWithValue(response.data);
          } else {
              return thunkAPI.rejectWithValue({ message: "Token or userId not provided" });
          }} 
        catch (error) {
            return thunkAPI.rejectWithValue({ message: error.response?.data?.message || "Login failed"});
      }
  }
);


export const registerUser = createAsyncThunk (
  "user/register",
  async (userAgent,thunkAPI) => {
    const {name, username, email, password} = userAgent;
      try{
          const response = await clientServer.post("/register", {
              name, username,email,password,
          });
          if(response.data.token){
              localStorage.setItem("token", response.data.token);
              return thunkAPI.fulfillWithValue(response.data);
          }else{
              return thunkAPI.rejectWithValue({
                  message:"token not provided"
              })
          }
      }catch(error){
          return thunkAPI.rejectWithValue({message : error.response?.data?.message || "signup failed"});
      }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (userAgent, thunkAPI) => {
    try {
      const { email, newPassword } = userAgent;
      const response = await clientServer.post("/resetPassword", {
        email,
        newPassword,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return thunkAPI.fulfillWithValue(response.data);
      } else {
        return thunkAPI.rejectWithValue({ message: "Token not provided" });
      }
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Password reset failed",
      });
    }
  }
);


// get user //
export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, thunkAPI) => {
      try {
        const response = await clientServer.get("/getAllUsers");
        //console.log("Users fetched:", response.data.users);
        return response.data.users;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return thunkAPI.rejectWithValue({
          message: error.response?.data?.message || "Failed to fetch users",
        });
      }
    }
);

//profile image
export const uploadProfilePicture = createAsyncThunk(
  "auth/uploadProfilePicture",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await clientServer.post("/update_profile_picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Upload failed");
    }
  }
);

// background image
export const uploadBackgroundImage = createAsyncThunk(
  "auth/uploadBackgroundImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await clientServer.post("/update_background_image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Upload failed");
    }
  }
);

// search user by name
export const getUserAndProfile = createAsyncThunk(
    "user/getUserAndProfile",
    async (_, thunkAPI) => {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          return thunkAPI.rejectWithValue("Token is missing");
        }
  
        const response = await clientServer.get(`/getUserAndProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        //console.log("Backend Response:", response.data); 
        return thunkAPI.fulfillWithValue(response.data); 
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Failed to fetch user profile"
        );
      }
    }
);

//update userdata
export const updateUserProfileAndData = createAsyncThunk(
    "user/updateUserProfileAndData",
    async ({ user, profileData }, thunkAPI) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return thunkAPI.rejectWithValue("Token missing");
  
        // 1. Update user profile
        await clientServer.post("/updateUserProfile", {
          name: user.name,
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture,
          backgroundImage: user.backgroundImage,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // 2. Update profile model
        const profileRes = await clientServer.post("/updateProfileData", profileData, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        toast.success("Profile updated successfully!");
        return profileRes.data;
      } catch (error) {
        console.error(error);
        toast.error("Error updating profile");
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Profile update failed"
        );
      }
    }
)

///send request ///
export const connectionRequest = createAsyncThunk(
  "user/connectionRequest",
  async ({ userId, connectionId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token"); // Ensure this token is set properly

      // Check if token is available before making request
      if (!token) {
        return thunkAPI.rejectWithValue({ message: "User is not authenticated" });
      }

      const response = await clientServer.post(
        "/connectionRequest",
        { userId, connectionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data; // Return the response data
    } catch (error) {
      console.error("Error in connectionRequest:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to send connection request",
      });
    }
  }
);

//get the pending and accepted requests
export const getMyConnectionsRequest = createAsyncThunk(
  "user/getMyConnectionsRequest",
  async(_, thunkAPI) => {
      try{
          const token = localStorage.getItem("token");
          const response = await clientServer.get("/getMyConnectionsRequest", {
              headers: {Authorization: `Bearer ${token}`},
          });
          return {
            pendingRequests: response.data.pendingRequests,
            acceptedConnections: response.data.acceptedConnections,
          }
      }catch(error){
          return thunkAPI.rejectWithValue({
              message: error.response?.data?.message || "Failed to fetch connection requests",
          });
      }
  }
)

//accept are reject are reset
export const handleConnectionRequest = createAsyncThunk(
  "user/handleConnectionRequest",
  async ({ connectionId, action }, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/handleConnectionRequest",
        { connectionId, action },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Response from handleConnectionRequest:", response.data);
      return { connectionId, action };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to handle request",
      });
    }
  }
);

///no of connections ///
export const whatAreMyConnections = createAsyncThunk(
  "auth/whatAreMyConnections",
  async (_, { rejectWithValue }) => {
    try {
      const res = await clientServer.get("/whatAreMyConnections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      //console.log("response" ,res.data);
     
      return res.data; // Return the response data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const downloadProfile = createAsyncThunk(
  "user/downloadProfile",
  async (userId, thunkAPI) => {
    try {
      const response = await clientServer.get(`/downloadProfile?id=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profile.pdf'); // Specify the file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to download profile",
      });
    }
  }
);