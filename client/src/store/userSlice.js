import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialUserState = {
  userData: {},
  allUsers: []
};

export const fetchUserdata = createAsyncThunk("chat/userData", async () => {
  const { data } = await axios.get("/profile");

  return data;
});
export const fetchAllUsers = createAsyncThunk("chat/allUsers", async () => {
  const { data } = await axios.get("/people");

  return data;
});

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    logout (state) {
      state.userData = {}
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserdata.fulfilled, (state, action) => {
      state.userData = action.payload
    })
    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
      state.allUsers = action.payload
    })
  },
});

export const userActions = userSlice.actions;

export default userSlice.reducer;
