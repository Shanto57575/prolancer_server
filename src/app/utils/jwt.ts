import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export const generateToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
): string => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

export const verifyToken = (token: string, secret: Secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.log(err);
    return null;
  }
};
