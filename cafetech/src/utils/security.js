import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

export const hashPassword = async (plainPassword) => {
  const saltRounds = 12;
  return await bcrypt.hash(plainPassword, saltRounds);
};


export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};
