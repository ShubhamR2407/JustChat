const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ws = require("ws");
const configureWebSocket = require("./server");
require("dotenv").config();

const userRoutes = require("./routes/user");
const messageRoutes = require('./routes/message')

const app = express();
app.use(
  cors({
    origin: "https://just-chat-client.vercel.app",
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json("hello");
});
app.use("/api", userRoutes);
app.use("/api", messageRoutes);

app.use((err, req, res, next) => {
  res.status(err.statuscode || 500).json({ error: err.message });
});

// Test email
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    const server = app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

    const wss = new ws.Server({ server });
    configureWebSocket(wss); // Pass the WebSocket server instance to the configureWebSocket function

    console.log("DB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Stop the application if there's an error connecting to MongoDB
  });

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// require("dotenv").config();

// const userRoutes = require("./routes/user");
// const messageRoutes = require('./routes/message')

// const configureWebSocket = require("./server");

// const app = express();
// app.use(
//   cors({
//     origin: "https://just-chat-client.vercel.app",
//     methods: ["POST", "GET"],
//     credentials: true,
//   })
// );
// app.use('/uploads', express.static(__dirname + '/uploads'))
// app.use(express.json());
// app.use(cookieParser());

// app.get("/",(req,res) => {
//   res.json("hello");
// })
// app.use("/api", userRoutes);
// app.use("/api", messageRoutes)

// app.use((err, req, res, next) => {
//   res.status(err.statuscode || 500).json({ error: err.message });
// });

// // testemail
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     const server = app.listen(5000, () => {
//       console.log("Server running on port 5000");
//     });

//     configureWebSocket(server)
//     console.log("DB connected");
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
//     process.exit(1); // Stop the application if there's an error connecting to MongoDB
//   });
