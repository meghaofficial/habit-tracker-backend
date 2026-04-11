import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import passport from "passport";
import { changePassword, deleteUser, forgotPassword, login, logout, refreshToken, resetPassword, signup } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", authMiddleware, logout);

router.post("/refresh", authMiddleware, refreshToken);

router.delete("/delete-user", authMiddleware, deleteUser);

router.put("/change-password", authMiddleware, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

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