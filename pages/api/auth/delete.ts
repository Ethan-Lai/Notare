import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Verify username or email is provided
    const { username, email } = req.body;
    if (!username && !email) {
        return res.status(400).json({ message: "Username or email must be provided." });
    }

    // Verify username/email are of string type
    if (username && typeof username !== "string") {
        return res.status(400).json({ message: "Username must be a string." });
    } else if (email && typeof email !== "string") {
        return res.status(400).json({ message: "Email must be a string." });
    }

    try {
        // Check if user exists based on username or email
        const existingUser: User | null = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: username?.toLowerCase() },
                    { email: email?.toLowerCase() }
                ]
            },
        });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user from the database
        await prisma.user.delete({
            where: {
                id: existingUser.id
            }
        });

        return res.status(200).json({ message: "Account successfully deleted" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
}
