import { Router } from "express";
import { cancelOtp, verifySignupOtp } from "../controllers/otpController";
const router = Router();

router.post("/verify-signup-otp", verifySignupOtp);
router.delete("/cancel-signup-otp", cancelOtp);

export const otpRoute = router;