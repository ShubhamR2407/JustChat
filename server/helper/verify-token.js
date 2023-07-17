const jwt = require('jsonwebtoken')

exports.verifyToken = (req,res) => {
  const token = req.cookies.access_token;

  return new Promise((resolve, reject) => {
    if (token) {
        jwt.verify(token, process.env.JWT_SCERET, {}, (err, userData) => {
          if(err) {
            reject(err)
          } else {
            resolve(userData)
          }
        });
      } else {
        reject(new Error("no token"))
      }
  })
};
