const jwt = require("jsonwebtoken");
const User = require("../api/user/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Não autorizado" });
  }
};

module.exports = authMiddleware;
