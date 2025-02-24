import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";  // Adjust based on the Prisma Client setup
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;
import { Request, Response } from "express";

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmpas: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ProfileRequest {
  userId: string;
}
interface AuthRequest extends Request {
  userId?: string;
}

interface TokenRequest {
  header: (name: string) => string | undefined;
}

const signup = async (req: { body: SignupRequest }, res: any): Promise<void> => {
  const { name, email, password, confirmpas } = req.body;
  console.log(req.body);
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

const login = async (req: { body: LoginRequest }, res: any): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user is not found, return a generic error
    if (!user) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid credentials",
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid credentials",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      token,
      email: user.email,
      username: user.name,
      id: user.id,
      password: user.password,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      isSuccess: false,
      message: "An error occurred while logging in",

    });
  }
};



const TokenisValid = async (req: TokenRequest, res: any): Promise<void> => {
  try {
    const token = req.header("token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!verified) return res.json(false);

    const user = await prisma.user.findUnique({
      where: { id: (verified as any).userId },
    });
    if (!user) return res.json(false);
    res.json(true);
  } catch (e: unknown) {
    if (e instanceof Error) {
      res.status(500).json({ error: e.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};




const getdata = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(400).json({ message: "User ID not found in request" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const token = req.header("token");

    res.json({
      email: user.email,
      username: user.name,
      id: req.userId,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export { signup, login, TokenisValid, getdata };
