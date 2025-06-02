import { createSlice } from "@reduxjs/toolkit";
import {
  createNewPost,
  getAllPosts,
  deletePost, 
  commentPost,
  getCommentsByPost,
  deleteComment,
  likes,
  addReply,
  deleteReply
} from "../../action/postAction";

const initialState = {
  posts: [],
  user: null,
  profile: null,
  isError: false,
  postFetched: false,
  isLoading: false,
  isLoggedIn: false,
  message: "",
  comment: [],
  postId: "",
  commentByPost: {},
  showPosts: false,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
    toggleShowposts: (state) => {
      state.showPosts = !state.showPosts;
    }
  },
  extraReducers: (builder) => {
    builder
      // GET ALL POSTS
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isError = false;
        state.postFetched = true;
        state.isLoading = false;
        state.posts = action.payload.post;
        state.postFetched = true;
        state.message = "Posts fetched successfully!";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })


      ///likes///
      .addCase(likes.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(likes.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId, type, likesCount, likedUsers, userId} = action.payload;
        //console.log("LIKES REDUCER HIT", action.payload);

        if (type === "post") {
          const index = state.posts.findIndex((post) => post._id === postId);
          if (index !== -1) {
            state.posts[index] = {
              ...state.posts[index],
              likedUsers,
              likesCount,
            };
          }
        }  else if (type === "comment") {
          const postIndex = state.posts.findIndex((post) => post._id === postId);
        
          if (postIndex !== -1) {
            const post = state.posts[postIndex];
        
            if (post && post.comments) {
              const commentIndex = post.comments.findIndex(
                (comment) => comment._id === action.payload.commentId
              );
        
              if (commentIndex !== -1) {
                post.comments[commentIndex] = {
                  ...post.comments[commentIndex],
                  likedUsers,
                  likesCount,
                };
            }
          }
        }
         else if (type === "reply") {
          const post = state.posts.find((post) => post._id === postId);
          if (post) {
            const comment = post.comments.find((comment) => comment._id === action.payload.commentId);
            if (comment) {
              const reply = comment.replies.find((reply) => reply._id === action.payload.replyId);
              if (reply) {
                const replyIndex = reply.likedUsers.findIndex(user => user._id === userId);
                if (replyIndex !== -1) {
                  comment.replies[replyIndex] = {
                    ...comment.replies[replyIndex],
                    likedUsers,
                    likesCount,
                  };
                }
              }
            }
          }
        }}
      })
      .addCase(likes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      ///create post///
      .addCase(createNewPost.pending, (state) => {
        state.isLoading = true;
        state.message = "Creating post...";
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
          state.isLoading = false;
          // Assuming action.payload is the updated post
          state.posts = state.posts.map(post => 
            post._id === action.payload._id ? action.payload : post
          );
        })
      .addCase(createNewPost.rejected, (state, action) => {
        state.message = action.payload;
        state.isError = true;
        state.isLoading = false;
      })
      
      ///getposts and delete ///
      .addCase(deletePost.fulfilled,(state,action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
      })
      // comment post //
      .addCase(commentPost.pending, (state) => {
        state.isLoading = true;
        state.message = "Commenting post...";
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        const { comment } = action.payload; 
        state.isLoading = false;
        state.isError = false;
        state.message = "Comment posted successfully";
      
        const updatedPost = state.posts.find(post => post._id === action.payload.postId);
        
        if (updatedPost) {
          updatedPost.comments.push(comment);
        }
      
      })
      
      .addCase(commentPost.rejected, (state, action) => {
        state.message = action.payload;
        state.isError = true;
        state.message = action.payload;
      })

      //get comments //
      .addCase(getCommentsByPost.pending, (state) => {
        state.isLoading = true;
        state.message = "fetching comments";
      })
      .addCase(getCommentsByPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.message = "Comments fetched successfully!";
        const postIndex = state.posts.findIndex((post) => post._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comments = comments;
        }
      })
      .addCase(getCommentsByPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      //delete comment //
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
        state.message = "Deleting comment...";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;

        if (state.commentByPost[postId]) {
          state.commentByPost[postId] = state.commentByPost[postId].filter(
            (c) => c._id !== commentId
          );
        }
        state.isLoading = false;
        state.isError = false;
        state.message = "Comment deleted successfully!";
      })
      
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      //reply//
      .addCase(addReply.pending, (state) => {
        state.isLoading = true;
        state.message = "Adding reply...";
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { postId, commentId, reply } = action.payload;

        // Find the post and the comment to which the reply belongs
        const postIndex = state.posts.findIndex(post => post._id === postId);
        if (postIndex !== -1) {
          const post = state.posts[postIndex];
          const commentIndex = post.comments.findIndex(comment => comment._id === commentId);
          if (commentIndex !== -1) {
            post.comments[commentIndex].replies.push(reply);
          }
        }
        state.isLoading = false;
        state.isError = false;
        state.message = "Reply added successfully!";
      })
      .addCase(addReply.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // ...existing code...
        .addCase(deleteReply.fulfilled, (state, action) => {
          const { postId, commentId, replyId } = action.payload;
          const post = state.posts.find(post => post._id === postId);
          if (post) {
            const comment = post.comments.find(comment => comment._id === commentId);
            if (comment) {
              comment.replies = comment.replies.filter(reply => reply._id !== replyId);
            }
          }
          state.isLoading = false;
          state.isError = false;
          state.message = "Reply deleted successfully!";
        })
        .addCase(deleteReply.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        })

  },
});

export const { reset, resetPostId,toggleShowposts } = postSlice.actions;
export default postSlice.reducer;
