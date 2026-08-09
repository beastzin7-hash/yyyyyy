import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/roblox/user", async (req, res) => {
  const username = String(req.query.username || "").trim();
  if (!username) {
    res.status(400).json({ error: "username required" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const userResponse = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false,
        }),
        signal: controller.signal,
      },
    );

    if (!userResponse.ok) {
      res.status(502).json({ error: "Roblox API error" });
      return;
    }

    const userData = (await userResponse.json()) as {
      data?: Array<{ id: number; name: string; displayName: string }>;
    };
    const user = userData.data?.[0];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [infoResponse, thumbnailResponse] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${user.id}`, {
        signal: controller.signal,
      }),
      fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
        { signal: controller.signal },
      ),
    ]);

    const info = infoResponse.ok
      ? ((await infoResponse.json()) as { created?: string })
      : {};
    const thumbnails = thumbnailResponse.ok
      ? ((await thumbnailResponse.json()) as {
          data?: Array<{ imageUrl?: string }>;
        })
      : { data: [] };

    res.json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarUrl: thumbnails.data?.[0]?.imageUrl ?? null,
      joinedYear: info.created ? new Date(info.created).getFullYear() : null,
    });
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      res.status(504).json({ error: "Roblox API timed out" });
    } else {
      res.status(502).json({ error: "Failed to fetch Roblox data" });
    }
  } finally {
    clearTimeout(timeout);
  }
});

export default router;