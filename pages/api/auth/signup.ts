import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient, User} from "@prisma/client";
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Verify username, email, and password are provided
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are all required." });
    }

    // Verify all are of string type
    if (typeof username !== "string") {
        return res.status(400).json({ message: "Username must be a string." });
    } else if (typeof email !== "string") {
        return res.status(400).json({ message: "Email must be a string." });
    } else if (typeof password !== "string") {
        return res.status(400).json({ message: "Password must be a string." });
    }

    try {
        // Check if username/email are already taken
        const existingUser: User | null = await prisma.user.findFirst({
            where: {
                OR: [{ name: username.toLowerCase() }, { email: email.toLowerCase() }]
            },
        });
        if (existingUser) {
            const message = existingUser.name == username.toLowerCase() ?
                "Username already taken" : "Email already taken";
            return res.status(400).json({ message });
        }

        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name: username.toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword
            }
        });

        return res.status(200).json({ message: "Account successfully created" });
    } catch (e) {
        console.error(e);
    }
}