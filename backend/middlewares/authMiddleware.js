// File: Gift_Flower_Website-/backend/middlewares/authMiddleware.js
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Không có token' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
      req.user = decoded;
      next();
    });
  };
  