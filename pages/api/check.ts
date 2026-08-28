import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.cookies["cot_session"] === "1") {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false });
}
