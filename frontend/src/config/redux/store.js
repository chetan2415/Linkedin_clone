import {
  configureStore,
  combineReducers,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";
import messageReducer from "./reducer/messageReducer";
import resumeReducer from "./reducer/resumeReducer";

// Combine all slices
const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  message: messageReducer,
  resume: resumeReducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Fix: Add middleware to ignore redux-persist actions
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create and export the persistor
export const persistor = persistStore(store);
