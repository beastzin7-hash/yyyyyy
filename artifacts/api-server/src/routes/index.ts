import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accessRouter from "./access";
import robloxRouter from "./roblox";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accessRouter);
router.use(robloxRouter);

export default router;
