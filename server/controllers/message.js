const { verifyToken } = require("../helper/verify-token");
const Message = require("../models/Message");

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userData = await verifyToken(req);
    const ourUserId = userData.userId;

    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ CreatedAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
