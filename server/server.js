const ws = require("ws");
const jwt = require("jsonwebtoken");
const fs = require('fs')

const Message = require("./models/Message");

function configureWebSocket(server) {
  const wss = new ws.WebSocketServer({ server });
  wss.on("connection", (connection, req) => {
    function notifyAboutOnlinePeople() {
      [...wss.clients].forEach((client) => {
        client.send(
          JSON.stringify({
            online: [...wss.clients].map((user) => ({
              userId: user.userId,
              username: user.username,
            })),
          })
        );
      });
    }

    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer)
        connection.terminate();
        notifyAboutOnlinePeople();
        console.log("dead");
      }, 1000);
    }, 5000);

    connection.on("pong", () => {
      clearTimeout(connection.deathTimer);
    });

    // reading username and id from token stored in cookie
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split(";")
        .find((str) => str.startsWith("access_token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];

        jwt.verify(token, process.env.JWT_SCERET, {}, (err, userData) => {
          if (err) throw err;

          const { userId, username } = userData;

          connection.userId = userId;
          connection.username = username;
        });
      }
    }

    connection.on("message", async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipientId, text, file } = messageData;
      let filename = null;

      if(file) {
        const parts = file.name.split('.')
        const ext = parts[parts.length - 1];
        filename = Date.now() + '.' + ext
        const path = __dirname + '/uploads/' + filename
        const bufferData = new Buffer(file.data.split(',')[1], 'base64')

        fs.writeFile(path, bufferData, () => {
          console.log('file saved: ' + path);
        } )
      }
      // console.log(file);
      if (recipientId && (text || file)) {
        const messageDoc = await Message.create({
          sender: connection.userId,
          recipient: recipientId,
          text: text,
          file: file ? filename : null,
        });
        console.log('created');
        [...wss.clients]
          .filter((client) => client.userId === recipientId)
          .forEach((r) =>
            r.send(
              JSON.stringify({
                text,
                sender: connection.userId,
                recipient: recipientId,
                file: file ? filename : null,
                _id: messageDoc._id,
              })
            )
          );
      }
    });

    //here we notify everyone online with other online people by sending an online array
    notifyAboutOnlinePeople();
  });
}

module.exports = configureWebSocket;
