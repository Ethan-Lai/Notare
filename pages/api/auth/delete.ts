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
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    // Verify all are of string type
    if (typeof email !== "string") {
        return res.status(400).json({ message: "Email must be a string." });
    }

    try {
        // Check if username/email exist
        const existingUser: User | null = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase()
            },
        });
        if (!existingUser) {
            const message = "User not found.";
            return res.status(400).json({ message });
        }

        await prisma.user.delete({
            where: {
                id: existingUser.id
            }
        });

        return res.status(200).json({ message: "Account successfully deleted" });
    } catch (e) {
        console.error(e);
    }
}