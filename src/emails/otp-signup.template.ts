// export const otpTemplate = (
//   username: string,
//   otp: string
// ) => `
//   <div>
//     <h2>Hello ${username}</h2>
//     <p>Your verification code is:</p>

//     <h1>${otp}</h1>

//     <p>This code expires in 10 minutes.</p>
//   </div>
// `;

export const otpTemplate = (
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
      background:linear-gradient(135deg,#5B5CF6,#8B5CF6);
      padding:30px;
      text-align:center;
    ">
      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:28px;
        font-weight:700;
      ">
        Habitify
      </h1>

      <p style="
        margin-top:8px;
        color:rgba(255,255,255,0.8);
        font-size:14px;
      ">
        Build habits that stick
      </p>
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
        line-height:1.7;
        margin-bottom:30px;
      ">
        Use the verification code below to complete your account verification.
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <!-- OTP -->
      <div style="text-align:center;margin:35px 0;">
        <div style="
          display:inline-block;
          padding:18px 40px;
          background:#f3f4f6;
          border:2px dashed #5B5CF6;
          border-radius:16px;
          color:#5B5CF6;
          font-size:32px;
          font-weight:700;
          letter-spacing:8px;
        ">
          ${otp}
        </div>
      </div>

      <p style="
        color:#6b7280;
        font-size:14px;
        line-height:1.7;
      ">
        If you didn't request this verification code, you can safely ignore this email.
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
