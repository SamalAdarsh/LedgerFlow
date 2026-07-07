const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Unauthorized Access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decoded.userId);

    req.user = user;

    return next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized Access, token is invalid",
    });
  }
};

const authSystemMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Unauthorized Access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user.systemUser) {
      res.status(403).json({
        message: "Forbidden Access, not a system user",
      });
    }

    req.user = user;

    return next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized Access, token is invalid",
    });
  }
};

module.exports = {authMiddleware,authSystemMiddleware};