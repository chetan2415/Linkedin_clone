import express from "express";
import multer from "multer";
const router = express.Router();

import { register, 
    login, 
    resetPassword,
    uploadProfilePicture, 
    updateUserProfile, 
    getUserAndProfile, 
    updateProfileData, 
    getAllUsers ,
    downloadProfile, 
    connectionRequest,
    getMyConnectionsRequest,
    whatAreMyConnections,
    handleConnectionRequest,
    getUserBySearch,
    uploadBackgroundImage } from "../controllers/UserController.js"; 


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename:(req,file,cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage: storage })

router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture);
    
router.route("/update_background_image")
    .post(upload.single('background_image'), uploadBackgroundImage);
 
router.post("/register", register);
router.post("/login", login);
router.post("/resetPassword", resetPassword);

router.post("/updateUserProfile", updateUserProfile);
router.get("/getUserAndProfile", getUserAndProfile);
router.post("/updateProfileData",updateProfileData);
router.get("/getUserBySearch", getUserBySearch);

router.get("/getAllUsers", getAllUsers);
router.get("/downloadProfile", downloadProfile);

router.post("/connectionRequest", connectionRequest);
router.get("/getMyConnectionsRequest", getMyConnectionsRequest);
router.get("/whatAreMyConnections", whatAreMyConnections);
router.post("/handleConnectionRequest", handleConnectionRequest);

export default router;
