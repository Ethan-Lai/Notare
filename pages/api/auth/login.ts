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

    // Verify all fields provided and of valid type
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ message: "You must provide your username/email and password." });
    } else if (identifier && typeof identifier !== "string") {
        return res.status(400).json({ message: "Username must be a string" });
    } else if (password && typeof password !== "string") {
        return res.status(400).json({ message: "Password must be a string" });
    }

    // Check if user exists
    try {
        const user: User | null = await prisma.user.findFirst({
            where: {
                OR: [{ name: identifier }, { email: identifier }]
            }
        });

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

        return res.status(200).json({ userId: session.userId, username: session.username, isLoggedIn: true });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Sorry, something went wrong." });
    }
}


