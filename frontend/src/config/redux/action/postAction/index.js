import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createNewPost = createAsyncThunk("posts/create", 
  async(formData,thunkAPI) => {
  try{
    const response = await clientServer.post("/createPost", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      }
    })
    return thunkAPI.fulfillWithValue(response.data);
    }catch(error){
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "failed to add post"
    );
  }
});

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
      try {
          const response = await clientServer.get('/getAllPosts',{
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log("posts fetched:", response.data.post);
          return thunkAPI.fulfillWithValue(response.data);
      } catch (error) {
          return thunkAPI.rejectWithValue(
              error.response?.data?.message || "Failed to fetch posts"
          );
      }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async(postId, thunkAPI) => {
    try{
      const response = await clientServer.delete(`/deletePost/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("post deleted.",postId);
      return thunkAPI.fulfillWithValue(postId);
    }catch(error){
      return thunkAPI.rejectWithValue(error.response?.data?.message || "failed to delete the post");
    }
  }
);

/// comments ///

export const commentPost = createAsyncThunk("post/commentpost", 
  async({postId, text}, thunkAPI) => {
    try{
      const response = await clientServer.post("/commentPost", {
        postId ,text,
      }, {
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      return {postId: response.data.postId,
      comment: response.data.comment};
    }catch(error){
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to comment on post");
    }
  }
);

export const getCommentsByPost = createAsyncThunk("post/getCommentByPost", 
  async(postId, thunkAPI) => {
    try{
      const response = await clientServer.get(`/getCommentsByPost?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return { postId, comments: response.data.comments };

    }catch(error){
      return thunkAPI.rejectWithValue(error.response?.data?.message || "failed to featch commment");
    }
  }
);

export const deleteComment = createAsyncThunk("post/deleteComment",
  async({postId,commentId}, thunkAPI) => {
    try{
      await clientServer.delete(`/deleteComment/${commentId}?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      return {postId, commentId};
    }catch(error){
      return thunkAPI.rejectWithValue(error.response?.data?.message || "failed to delete the comment");
    }
  }
);

//likes //
export const likes = createAsyncThunk(
  "post/likes",
  async ({ postId, type, commentId, replyId }, { rejectWithValue }) => {
    try {
      const response = await clientServer.put(
        `likes/${postId}${type === "comment" ? `/comment/${commentId}` : ""}${type === "reply" ? `/comment/${commentId}/reply/${replyId}` : ""}`,
        { type, commentId, replyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return {
        postId,
        type,
        likedUsers: response.data.likedUsers,
        likesCount: response.data.likesCount,
      };
    } catch (error) {
      console.error("Error in likes thunk:", error);
      return rejectWithValue(error.response.data);
    }
  }
);

// Add a reply to a comment
export const addReply = createAsyncThunk(
  "post/addReply",
  async ({ postId, commentId, text, replyToUserId}, thunkAPI) => {
    try {
      const response = await clientServer.post(`/addReply/${postId}/${commentId}`,
        { text, replyToUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return {
        postId,
        commentId,
        reply: response.data.reply || null, 
      };
    } catch (error) {
      console.error("Error adding reply:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add reply"
      );
    }
  }
);

export const deleteReply = createAsyncThunk(
  "post/deleteReply",
  async({ postId, commentId, replyId }, thunkAPI) => {
    try {
      await clientServer.delete(`/deleteReply/${postId}/${commentId}/${replyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      return { postId, commentId, replyId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete reply");
    }
  }
);