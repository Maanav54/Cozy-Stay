const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'verysecretkey';
module.exports = function(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch(e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
