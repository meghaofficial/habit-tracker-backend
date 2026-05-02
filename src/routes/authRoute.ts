import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import passport from "passport";
import { changePassword, deleteUser, forgotPassword, login, logout, refreshToken, resetPassword, signup, updateName, updateRole } from "../controllers/authController";
import { canAccessDashboard } from "../middlewares/dashboardMiddleware";
import { isAuthorized, isAdmin } from "../middlewares/authMiddleware";

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", isAuthorized, logout);

router.get("/refresh", refreshToken);

router.delete("/delete-user", isAuthorized, deleteUser);

router.patch("/change-password", isAuthorized, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.patch("/update-role", isAuthorized, isAdmin, updateRole);
router.patch("/update-username", isAuthorized, updateName);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user
    });
  }
);

export const userRoute = router;