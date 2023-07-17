import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialMessageState = {
  messages: [],
};

export const fetchMessages = createAsyncThunk("chat/messages", async ( selectedUserId , { rejectWithValue }) => {
    try {
      const response = await axios.get("/messages/" + selectedUserId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });
  

const messageSlice = new createSlice({
  name: "messages",
  initialState: initialMessageState,
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload
    })
  },
});

export const messageAction = messageSlice.action

export default messageSlice.reducer
