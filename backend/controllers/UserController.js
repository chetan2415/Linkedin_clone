import User from "../models/UserModel.js"; 
import Profile from "../models/ProfileModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { syncIndexes } from "mongoose";
import convertUserDatatoPDF from "../PDF.js";
import ConnectionModel from "../models/CommectionModel.js";
import path from "path";

export const register = async (req, res) => {
  try {
    const { name, username, email, password, profilePicture, backgroundImage } = req.body;

    if(!name || !email || !password || !username) return res.status(400).json({message:"all fileds are required"});

    const user = await User.findOne({email});

    if(user) return res.status(400).json({message:"user already exists"});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      profilePicture : profilePicture || "default.jpg",
      backgroundImage: backgroundImage || "",
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ userId: savedUser._id, email: savedUser.email }, process.env.TOKEN_KEY || "defaultSecretKey");
    const userObj = savedUser.toObject ? savedUser.toObject() : savedUser;
    delete userObj.password;
    res.status(201).json({ message: "User registered successfully", token, user: { ...userObj, userId: savedUser._id.toString()} });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('password _id name username email profilePicture backgroundImage');

    if (!user) {
      return res.status(400).json({ error: "Invalid user, please signup first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.TOKEN_KEY || "defaultSecretKey"
    );

    // Prepare user object excluding password
    let userData = user.toObject ? user.toObject() : user;
    delete userData.password;

    res.status(200).json({ message: "Login successful", token, user: { ...userData, userId: user._id.toString() } });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.TOKEN_KEY || "defaultSecretKey"
    );

    const { password, ...userData } = user.toObject();
    res.status(200).json({ message: "Password reset successful", token, user: userData });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const uploadProfilePicture = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: "Token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY); 
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename; 
    await user.save();

    res.status(200).json({ profilePicture: req.file.filename });

  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const uploadBackgroundImage = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY); 
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save background image to user's profile
    user.backgroundImage = req.file.filename;
    await user.save();

    res.status(200).json({ backgroundImage: req.file.filename });

  } catch (error) {
    console.error("Error uploading background image:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try{
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, username, email, profilePicture, backgroundImage } = req.body;
    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;
    if (backgroundImage) user.backgroundImage = backgroundImage;

    await user.save();

    return res.status(200).json({
      message: "User profile updated successfully",
      user,
    });
    }
    catch(error){
    console.error("cannot update userProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    const { id } = req.query; 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //console.log("Decoded User ID from token:", userId);
    //console.log("Fetched User _id from DB:", user._id);

    let profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      console.log("No profile found. Creating a new profile with matching _id and userId...");
      profile = new Profile({
        _id: user._id, 
        userId: user._id,
        bio: " ",
        currentPosition: " ",
        education: [],
        pastWork: [],
      });
      await profile.save();
    } else if (profile._id.toString() !== user._id.toString()) {
      //console.log("Mismatch in profile _id and userId. Deleting and recreating profile...");

      await Profile.deleteOne({ _id: profile._id });

      profile = new Profile({
        _id: user._id, 
        userId: user._id,
        bio: " ",
        currentPosition: " ",
        education: [],
        pastWork: [],
      });
      await profile.save();
    }

    const userProfile = await Profile.findOne({ _id: user._id }).populate({
      path: "userId",
      select: "name email username profilePicture backgroundImage",
    });

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found after creation or correction" });
    }

    return res.json({
      message: "User profile fetched successfully",
      user: {
         _id: userProfile.userId._id, 
        userId: userProfile.userId._id,
        name: userProfile.userId.name,
        username: userProfile.userId.username,
        email: userProfile.userId.email,
        profilePicture: userProfile.userId.profilePicture,
        backgroundImage: userProfile.userId.backgroundImage,
      },
      profile: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid userId in token" });
    }

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { bio, currentPosition, education, pastWork } = req.body;

    if (bio) profile.bio = bio;
    if (currentPosition) profile.currentPosition = currentPosition;

    if (education) {
      profile.education = Array.isArray(education)
        ? education.filter(item => item.school && item.fieldOfStudy && item.degree && item.years)
        : [education];
    }

    if (pastWork) {
      profile.pastWork = Array.isArray(pastWork)
        ? pastWork.filter(item => item.company && item.position && item.years)
        : [pastWork];
    }

    await profile.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
   
    const users = await User.find({}).select("name email username profilePicture profile backgroundImage");

    const profiles = await Profile.find({ userId: { $in: users.map((user) => user._id) } });

    const usersWithProfiles = users.map((user) => {
      const profile = profiles.find((p) => String(p.userId) === String(user._id)); 
      return {
        ...user.toObject(), 
        profile: profile ? profile.toObject() : null, 
      };
    });

    return res.json({
      message: "Users fetched successfully",
      users: usersWithProfiles,
    });
  } catch (error) {
    console.error("Error fetching users with profiles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    //console.log("Raw query object:", req.query);
    //console.log("User ID from query:", req.query.id);


    const userProfile = await Profile.findOne({ userId: user_id })
      .populate('userId', 'name username email profilePicture');

    if (!userProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const outputPath = await convertUserDatatoPDF(userProfile);
    const filePath = path.resolve(outputPath);

    // Send the file as a download
    res.download(filePath, outputPath, (err) => {
      if (err) {
        //console.error("Download error:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const connectionRequest = async (req, res) => {
  try {
    const { userId, connectionId } = req.body;

    if (!userId || !connectionId) {
      return res.status(400).json({ message: "User ID and Connection ID are required" });
    }

    // Fetch users and log errors if any
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    // Check if a connection request already exists
    const existingRequest = await ConnectionModel.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Create a new connection request
    const request = new ConnectionModel({
      userId,
      connectionId,
    });

    await request.save();

    return res.status(200).json({ message: "Request sent successfully" });

  } catch (error) {
    console.error("Error in connection request for userId:", req.body.userId, "connectionId:", req.body.connectionId, error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getMyConnectionsRequest = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const pendingRequests = await ConnectionModel.find({
      connectionId: userId,
      state_accepted: null,
    }).populate("userId connectionId", "name username email profilePicture");

    const acceptedConnections = await ConnectionModel.find({
      connectionId: userId,
      state_accepted: true,
    }).populate("userId connectionId", "name username email profilePicture");


    //console.log("Pending Requests:", pendingRequests);
    //console.log("Accepted Connections:", acceptedConnections);

    return res.status(200).json({
      message: "Connection data fetched successfully",
      pendingRequests,
      acceptedConnections,
    });
  } catch (error) {
    console.error("Error fetching connection requests:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const whatAreMyConnections = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token is missing" });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const connections = await ConnectionModel.find({
      $or: [{ userId }, { connectionId: userId }],
      state_accepted: true,
    })
      .populate("userId", "name username email profilePicture backgroundImage")
      .populate("connectionId", "name usrname email profilePicture backgroundImage");

    const formattedConnections = connections.map(conn => {
      const isUserInitiator = conn.userId._id.toString() === userId;
      return isUserInitiator ? conn.connectionId : conn.userId;
    });

    return res.status(200).json({
      message: "Connections fetched successfully",
      connections: formattedConnections
    });

  } catch (error) {
    console.error("Error fetching connections:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const handleConnectionRequest = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: Token is missing" });

    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY || "defaultSecretKey");
    const userId = decodedToken.userId;
    if (!userId) return res.status(400).json({ message: "Invalid token" });

    const { connectionId, action } = req.body;
    if (!connectionId) return res.status(400).json({ message: "Connection ID is required" });

    if (!["accept", "reject", "reset"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'accept', 'reject', or 'reset'" });
    }

    const query = {
      userId: connectionId,
      connectionId: userId,
    };

    if (action === "accept") {
      query.state_accepted = null;
    }

    const connectionRequest = await ConnectionModel.findOne(query);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found or already handled" });
    }

    if (action === "accept") {
      connectionRequest.state_accepted = true;
      await connectionRequest.save();
      return res.status(200).json({ message: "Connection request accepted successfully" });
    } else if (action === "reject") {
      await ConnectionModel.deleteOne({ _id: connectionRequest._id });
      return res.status(200).json({ message: "Connection request rejected successfully" });
    } else if (action === "reset") {
      connectionRequest.state_accepted = null;
      await connectionRequest.save();
      return res.status(200).json({ message: "Connection reset successfully" });
    }
  } catch (error) {
    console.error("Error handling connection request:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUserBySearch = async (req, res) => {
  const { username } = req.query;

  try {
    let user;
    if (username.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(username);
    }
    if (!user) {
      user = await User.findOne({
        $or: [
          { username: { $regex: new RegExp(username, "i") } },
          { name: { $regex: new RegExp(username, "i") } }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture backgroundImage");

    return res.json({ profile: userProfile });
  } catch (error) {
    console.error("Unable to get searched user data", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



