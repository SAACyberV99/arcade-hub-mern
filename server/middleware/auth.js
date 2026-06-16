const jwt = require('jsonwebtoken');

/**
 * Protects a route by requiring a valid JWT in the Authorization header.
 * Expected header format: "Authorization: Bearer <token>"
 * On success, attaches { id, username } to req.user.
 */
module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};
