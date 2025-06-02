import express from "express";
import multer from "multer";
const router = express.Router();

import { createPost, 
        getAllPosts, 
        deletePost, 
        commentPost, 
        getCommentsByPost, 
        deleteComment, 
        likes, 
        addReply,
        deleteReply} from "../controllers/PostController.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename:(req,file,cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
})

const upload = multer({ storage: storage })

router.post("/createPost", upload.array("media", 10), createPost);
router.get("/getAllPosts", getAllPosts);
router.delete("/deletePost/:id", deletePost);

router.post("/commentPost", commentPost);
router.get("/getCommentsByPost", getCommentsByPost);
router.delete("/deleteComment/:commentId", deleteComment);


router.put("/likes/:postId", likes);
router.put("/likes/:postId/comment/:commentId", likes);
router.put("/likes/:postId/comment/:commentId/reply/:replyId", likes);

router.post("/addReply/:postId/:commentId", addReply);
router.delete("/deleteReply/:postId/:commentId/:replyId", deleteReply);
export default router;