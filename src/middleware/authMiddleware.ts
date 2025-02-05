// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || '';

// interface DecodedToken {
//   userId: string;
// }

// const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
//   const token = req.header("token");

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// export { authMiddleware };
