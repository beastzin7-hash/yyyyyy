import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();
const ADMIN_SESSION_COOKIE = "roblox_prank_admin";
const DEFAULT_USERNAME = "beastrobux";
const DEFAULT_PASSWORD = "robux99";
const ADMIN_PASSWORD = "BeastRobuxAdmin66";
const DEFAULT_DAYS_REMAINING = 19;

// This app is a demo. Keep access credentials separate from Roblox accounts and
// do not persist visitor passwords or Roblox credentials.
let demoUsername = DEFAULT_USERNAME;
let demoPassword = DEFAULT_PASSWORD;
let daysRemaining = DEFAULT_DAYS_REMAINING;

function isAdminAuthenticated(req: Request) {
  return req.signedCookies?.[ADMIN_SESSION_COOKIE] === "authenticated";
}

router.get("/access/config", (_req, res) => {
  res.json({ username: demoUsername, daysRemaining });
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

  const requestedUsername =
    typeof req.body?.loginUsername === "string"
      ? req.body.loginUsername.trim()
      : "";
  const requestedPassword =
    typeof req.body?.loginPassword === "string" ? req.body.loginPassword : "";
  const nextDays =
    typeof req.body?.daysRemaining === "number" ? req.body.daysRemaining : NaN;
  const nextUsername = requestedUsername || demoUsername;
  const changingPassword = requestedPassword.length > 0;

  if (
    nextUsername.length < 1 ||
    (changingPassword && requestedPassword.trim().length < 4) ||
    !Number.isInteger(nextDays) ||
    nextDays < 0 ||
    nextDays > 365
  ) {
    res.status(400).json({
      error: "A username, password, and whole number of days from 0 to 365 are required",
    });
    return;
  }

  demoUsername = nextUsername;
  if (changingPassword) demoPassword = requestedPassword;
  daysRemaining = nextDays;
  res.json({ username: demoUsername, daysRemaining });
});

export default router;