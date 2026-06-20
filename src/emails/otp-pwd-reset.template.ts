export const resetPasswordOTPTemplate = (
  username: string,
  otp: string
) => `
<div style="background:#f4f7fb;padding:40px 20px;font-family:Arial,sans-serif;">

  <div style="
    max-width:600px;
    margin:0 auto;
    background:#ffffff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,0.08);
  ">

    <!-- Header -->
    <div style="
      background:linear-gradient(135deg,#3b82f6,#6366f1);
      padding:30px;
      text-align:center;
    ">
      <div style="
        width:70px;
        height:70px;
        margin:0 auto 15px;
        border-radius:50%;
        background:rgba(255,255,255,0.15);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:30px;
      ">
        🔒
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:28px;
        font-weight:700;
      ">
        Password Reset Request
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:40px 30px;">

      <h2 style="
        margin:0 0 15px 0;
        color:#111827;
        font-size:22px;
      ">
        Hello ${username},
      </h2>

      <p style="
        color:#6b7280;
        font-size:15px;
        line-height:1.8;
        margin-bottom:30px;
      ">
        We received a request to reset the password for your Habitify account.
        Use the verification code below to continue.
      </p>

      <!-- OTP Box -->
      <div style="text-align:center;margin:35px 0;">
        <div style="
          display:inline-block;
          padding:18px 40px;
          background:#eff6ff;
          border:2px dashed #3b82f6;
          border-radius:16px;
          color:#2563eb;
          font-size:32px;
          font-weight:700;
          letter-spacing:8px;
        ">
          ${otp}
        </div>
      </div>

      <div style="
        background:#fefce8;
        border:1px solid #fde68a;
        border-radius:12px;
        padding:16px;
        margin-top:25px;
      ">
        <p style="
          margin:0;
          color:#92400e;
          font-size:14px;
          line-height:1.7;
        ">
          ⏳ This OTP is valid for <strong>10 minutes</strong>.
        </p>
      </div>

      <p style="
        margin-top:25px;
        color:#6b7280;
        font-size:14px;
        line-height:1.8;
      ">
        If you did not request a password reset, please ignore this email.
        Your account will remain secure and no changes will be made.
      </p>

    </div>

    <!-- Footer -->
    <div style="
      border-top:1px solid #e5e7eb;
      padding:20px;
      text-align:center;
      color:#9ca3af;
      font-size:12px;
    ">
      © 2026 Habitify. All rights reserved.
    </div>

  </div>

</div>
`;