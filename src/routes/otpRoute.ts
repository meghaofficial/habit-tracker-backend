import { Router } from "express";
import { cancelOtp, verifySignupOtp, verifyChangePwdOtp } from "../controllers/otpController";
const router = Router();

router.post("/verify-signup-otp", verifySignupOtp);
router.post("/verify-change-pwd-otp", verifyChangePwdOtp);
router.delete("/cancel-signup-otp", cancelOtp);

export const otpRoute = router;