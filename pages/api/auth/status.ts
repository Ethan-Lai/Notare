import {NextApiRequest, NextApiResponse} from "next";
import {getIronSession} from "iron-session";
import {defaultSession, SessionData, sessionOptions} from "@/lib/lib";

/**
 * Endpoint used to fetch the user's session status.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
    }

    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.userId) {
        return res.status(200).json(defaultSession);
    }

    return res.status(200).json(session);
}