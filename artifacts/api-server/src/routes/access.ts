import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();
const ADMIN_SESSION_COOKIE = "roblox_prank_admin";
const DEFAULT_USERNAME = "beastrobux";
const DEFAULT_PASSWORD = "robux99";
const ADMIN_PASSWORD = "BeastRobuxAdmin66";

// This app is a demo. Keep access credentials separate from Roblox accounts and
// do not persist visitor passwords or Roblox credentials.
let demoUsername = DEFAULT_USERNAME;
let demoPassword = DEFAULT_PASSWORD;

function isAdminAuthenticated(req: Request) {
  return req.signedCookies?.[ADMIN_SESSION_COOKIE] === "authenticated";
}

router.get("/access/config", (_req, res) => {
  res.json({ username: demoUsername });
});

router.post("/access/login", (req, res) => {
  const username =
    typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  if (username !== demoUsername || password !== demoPassword) {
    res.status(401).json({ error: "Invalid demo username or password" });
    return;
  }

  res.json({ ok: true, demo: true });
});

router.post("/access/admin/login", (req, res) => {
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (password !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Invalid administrator password" });
    return;
  }

  res.cookie(ADMIN_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.json({ ok: true });
});

router.get("/access/admin/status", (req, res) => {
  res.json({ authenticated: isAdminAuthenticated(req) });
});

router.post("/access/admin/logout", (_req, res) => {
  res.clearCookie(ADMIN_SESSION_COOKIE);
  res.json({ ok: true });
});

router.post("/access/admin/update", (req, res) => {
  if (!isAdminAuthenticated(req)) {
    res.status(403).json({ error: "Administrator authentication required" });
    return;
  }

  const username =
    typeof req.body?.loginUsername === "string"
      ? req.body.loginUsername.trim()
      : "";
  const password =
    typeof req.body?.loginPassword === "string" ? req.body.loginPassword : "";

  if (username.length < 1 || password.trim().length < 4) {
    res.status(400).json({
      error: "A username and a password of at least 4 characters are required",
    });
    return;
  }

  demoUsername = username;
  demoPassword = password;
  res.json({ username: demoUsername });
});

export default router;