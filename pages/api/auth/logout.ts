import { NextApiRequest, NextApiResponse } from "next";
import {getIronSession} from "iron-session";
import {sessionOptions} from "@/lib/lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getIronSession(req, res, sessionOptions);
    session.destroy();
    return res.status(200).json({ isLoggedIn: false });
}