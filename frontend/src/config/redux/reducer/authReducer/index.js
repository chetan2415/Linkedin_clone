import {createSlice} from "@reduxjs/toolkit";

import {  loginUser, 
          registerUser,
          resetPassword, 

          getAllUsers, 

          uploadProfilePicture,
          uploadBackgroundImage,

          getUserAndProfile,
          updateUserProfileAndData,

          connectionRequest,
          getMyConnectionsRequest,
          handleConnectionRequest, 
          whatAreMyConnections,
          downloadProfile } from "../../action/authAction";

    const getInitialUser = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          // Fallback: if userId exists but _id does not, set _id = userId
          if (!user._id && user.userId) user._id = user.userId;
          return user;
        }
      }
      return null;
    };

const initialState = {
    user: getInitialUser(),
    profile:null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    isLoggedIn: !!getInitialUser(),
    message: "",
    profileFetched: false,
    connections: [],
    connectionRequest: [],
    allUsers: [],
    myConnections: [],
    profilePicture: null,
    backgroundImage: null, 
    pendingRequests: [],
    acceptedConnections: [],
  }

const authSlice = createSlice({
  name:"auth",
    initialState,
    reducers: {
      setUser: (state, action) => {
        state.user = action.payload.user; 
        state.isLoggedIn = true;
      },
        reset: () => initialState,
        logout: () => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return initialState;
        },
        handelLoginUser: (state) => {
            state.message = "hello";
        },
    },
  
    extraReducers: (builder) => {
        // Login User
        builder.addCase(loginUser.pending, (state) => {
          state.isLoading = true;
          state.message = "moving to the mainPage";
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isError = false;
          state.isSuccess = true;
          state.isLoggedIn = true;
          state.user = action.payload.user; 
          state.message = "Login is successful";
        })
        
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Login failed"
        })
        // Register User
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.message = "loading"
        })
        .addCase(registerUser.fulfilled, (state,action) => {
            state.isSuccess = true;
            state.isLoading = false;
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.message = "user signup successful";
            state.isError = false;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isError = true;
            state.message = action.payload?.message || "registration failed";
            state.isLoading = false;
        })
        // Reset Password
        .addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.message = "Resetting password...";
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.message = "Password reset successful";
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Password reset failed";
        })
        //// get all users ////
        .addCase(getAllUsers.pending, (state) => {
            state.isLoading = true;
            state.message = "Fetching all users...";
          })
          .addCase(getAllUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.allUsers = action.payload;
            state.isError = false;
            state.isSuccess = true;
            state.message = "All users fetched successfully";
          })
          .addCase(getAllUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Failed to fetch users";
          })
         
          //get my connections request
          .addCase(getMyConnectionsRequest.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
          })
          .addCase(getMyConnectionsRequest.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "Connections fetched successfully" || action.payload.message;
            state.isSuccess = true;
            state.pendingRequests = action.payload?.pendingRequests || []; // Update pending requests
            state.acceptedConnections = action.payload?.acceptedConnections || []; // Update accepted connections
          })
          .addCase(getMyConnectionsRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload?.message || "Something went wrong";
          })
          
          //accept or reject connection request
          .addCase(handleConnectionRequest.fulfilled, (state, action) => {
            console.log("handleConnectionRequest fulfilled:", action.payload); // Debugging payload
            const { connectionId, action: decision } = action.payload;
          
            if (decision === "accept" || decision === "reject") {
              // Update the state to reflect the accepted/rejected status
              state.connectionRequest = state.connectionRequest.map((req) => {
                if (req.connectionId._id === connectionId) {
                  return {
                    ...req,
                    state_accepted: decision === "accept" ? true : false, // Accept or Reject
                  };
                }
                return req;
              });
            }
            if (decision === "reject") {
              // Remove rejected request
              state.connectionRequest = state.connectionRequest.filter(
                (req) => req.connectionId._id !== connectionId
              );
            }
          })
          
        ///send request ///
        .addCase(connectionRequest.pending, (state) => {
          state.isLoading = true;
          state.message = "Sending connection request...";
        })
        .addCase(connectionRequest.fulfilled, (state, action) => {
          console.log("Connection request fulfilled:", action.payload); // Debugging payload
          state.isError = false;
          state.isLoading = false;
          state.isSuccess = true;
          state.user = action.payload.user; 
          state.message = "Connection request sent successfully!";
        })
        .addCase(connectionRequest.rejected, (state, action) => {
          console.log("Connection request rejected:", action.payload); // Debugging payload
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload.message || "Connection request failed";
        })
        
          ///no. of connections///
          .addCase(whatAreMyConnections.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.message = "Connections fetched successfully!";
            state.myConnections = action.payload.connections || [];
          })          
          // Search User by Name
          .addCase(getUserAndProfile.pending, (state) => {
            state.isLoading = true;
            state.message = "Fetching user profile...";
          })
          .addCase(getUserAndProfile.fulfilled, (state, action) => {
          //console.log("getUserAndProfile.fulfilled payload:", action.payload); // Debugging payload
           if (action.payload.user && !action.payload.user._id && action.payload.user.userId) {
    action.payload.user._id = action.payload.user.userId;
  }
            state.isLoading = false;
            state.isError = false;
            state.user = action.payload.user;
            state.profile = action.payload.profile;
            state.message = "User profile fetched successfully!";
          })
          .addCase(getUserAndProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          })

           // UPDATE USER + PROFILE
          .addCase(updateUserProfileAndData.pending, (state) => {
            state.isLoading = true;
            state.message = "Updating profile...";
          })
          .addCase(updateUserProfileAndData.fulfilled, (state, action) => {
            state.profile = action.payload;
            state.message = "User profile updated successfully!";
            state.isError = false;
            state.isLoading = false;
          })
          .addCase(updateUserProfileAndData.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          })

          //profile image upload
          .addCase(uploadProfilePicture.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "Uploading profile picture...";
          })
          .addCase(uploadProfilePicture.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "Profile picture uploaded successfully.";
            // Update the profile picture in the state
            if (state.user) {
              state.user.profilePicture = action.payload.profilePicture || action.payload.filename;
            }
            state.profilePicture = action.payload.profilePicture || action.payload.filename; // Save profile picture
          })
          .addCase(uploadProfilePicture.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          })
    
        // Background Image Upload Handlers
          .addCase(uploadBackgroundImage.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "Uploading background image...";
          })
          .addCase(uploadBackgroundImage.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "Background image uploaded successfully.";
            // Update the background image in the state
            if (state.user) {
              state.user.backgroundImage = action.payload.backgroundImage || action.payload.filename;
            }
            state.backgroundImage = action.payload.backgroundImage || action.payload.filename; // Save background image
          })
          .addCase(uploadBackgroundImage.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          })
          // Download Profile
          .addCase(downloadProfile.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "Downloading profile...";
          })
          .addCase(downloadProfile.fulfilled, (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = "Profile downloaded successfully.";
          })
          .addCase(downloadProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
          })
                      
    }
})
export const { reset, handelLoginUser, setUser, logout } = authSlice.actions;
export default authSlice.reducer