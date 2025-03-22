import { getIronSession } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';
import { defaultSession, sessionOptions, SessionData } from '@/lib/lib'
import {PrismaClient, User} from "@prisma/client";
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Check if any of email/username + password are missing or of invalid type
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        return res.status(400).json({ message: "You must provide your username/email and password." });
    } else if (username && typeof username !== "string") {
        return res.status(400).json({ message: "Username must be a string" });
    } else if (email && typeof email !== "string") {
        return res.status(400).json({ message: "Email must be a string" });
    } else if (password && typeof password !== "string") {
        return res.status(400).json({ message: "Password must be a string" });
    }

    // Check if user exists
    try {
        let user: User | null = null;
        if (email) {
            user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        } else if (username) {
            user = await prisma.user.findUnique({ where: { name: username.toLowerCase() } });
        }

        // If no existing user found, return 400 error
        if (!user) {
            return res.status(400).json({ message: "Incorrect username, email, or password." });
        }

        // Verify password is correct
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: "Incorrect username, email, or password." }); // Probably not the safest but whatever
        }

        // User logged in, create a session
        const session = await getIronSession<SessionData>(req, res, sessionOptions);
        session.isLoggedIn = true;
        session.username = user.name;
        session.userId = user.id;
        await session.save();

        return res.status(200).json({ message: "Login Successful" });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Sorry, something went wrong." });
    }
}


