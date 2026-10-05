import type { Request, Response } from "express";
import webpush from "../config/webPush";
import { PushSubscriptionModel } from "../models/pushSubscription.model";

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.hash
    ) {
      return false;
    }

    return (
      url.hostname === "fcm.googleapis.com" ||
      url.hostname === "updates.push.services.mozilla.com" ||
      url.hostname.endsWith(".push.services.mozilla.com") ||
      url.hostname === "web.push.apple.com"
    );
  } catch {
    return false;
  }
}

export const subscribeToNotifications = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      });
    }

    const { endpoint, keys } = req.body ?? {};

    if (
      typeof endpoint !== "string" ||
      endpoint.length > 4096 ||
      !isAllowedEndpoint(endpoint) ||
      typeof keys?.p256dh !== "string" ||
      typeof keys?.auth !== "string" ||
      !/^[A-Za-z0-9_-]+={0,2}$/.test(keys.p256dh) ||
      !/^[A-Za-z0-9_-]+={0,2}$/.test(keys.auth) ||
      Buffer.from(keys.p256dh, "base64url").length !== 65 ||
      Buffer.from(keys.auth, "base64url").length !== 16
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsupported push subscription",
      });
    }

    await PushSubscriptionModel.updateOne(
      { endpoint },
      {
        $set: {
          userID,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        },
      },
      { upsert: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Push notifications enabled",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not save push subscription",
    });
  }
};

export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user?.id;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Please log in",
      });
    }

    const subscriptions = await PushSubscriptionModel.find({ userID });

    if (!subscriptions.length) {
      return res.status(404).json({
        success: false,
        message: "Enable notifications on a device first",
      });
    }

    const payload = JSON.stringify({
      title: "Habitify",
      body: "Your push notifications are working! 🎉",
    });

    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys!.p256dh!,
                auth: subscription.keys!.auth!,
              },
            },
            payload,
            { TTL: 60, timeout: 10_000 },
          );

          return true;
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;

          if (statusCode === 404 || statusCode === 410) {
            await PushSubscriptionModel.deleteOne({
              _id: subscription._id,
              userID,
            });
          }

          // Avoid logging subscription endpoints or encryption keys.
          console.error("Push delivery failed:", statusCode ?? "network error");

          return false;
        }
      }),
    );

    const accepted = results.filter(Boolean).length;

    return res.status(accepted > 0 ? 200 : 502).json({
      success: accepted > 0,
      message:
        accepted > 0
          ? "Test notification accepted by push service"
          : "Could not send to any subscribed device",
      accepted,
      failed: results.length - accepted,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not send test notification",
    });
  }
};
