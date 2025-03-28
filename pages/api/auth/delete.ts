import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient} from "@prisma/client";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "@/lib/lib";
import withAuth from "@/lib/withAuth";

const prisma = new PrismaClient();

async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Get user ID from session (already verified by withAuth middleware)
        const userId = (req as any).userId;
        
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Delete all notes associated with the user
        await prisma.note.deleteMany({
            where: {
                authorId: userId
            }
        });

        // Delete the user
        await prisma.user.delete({
            where: {
                id: userId
            }
        });

        // Clear the session
        const session = await getIronSession<SessionData>(req, res, sessionOptions);
        session.destroy();

        return res.status(200).json({ message: "Account successfully deleted" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "An error occurred while deleting the account" });
    } finally {
        await prisma.$disconnect();
    }
}

// Wrap with our authentication middleware
export default withAuth(handler);