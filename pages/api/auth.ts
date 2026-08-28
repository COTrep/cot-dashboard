import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { user, pass } = req.body ?? {};
  const validUser = process.env.AUTH_USER;
  const validPass = process.env.AUTH_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: "Auth not configured" });
  }

  if (user === validUser && pass === validPass) {
    const maxAge = 7 * 24 * 60 * 60;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
      "Set-Cookie",
      `cot_session=1; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=${maxAge}`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
