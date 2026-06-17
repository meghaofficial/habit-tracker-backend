export const passwordChangedTemplate = (
  username: string
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
      background:linear-gradient(135deg,#10b981,#059669);
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
        font-size:32px;
      ">
        ✓
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:28px;
        font-weight:700;
      ">
        Password Updated
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
        margin-bottom:25px;
      ">
        Your account password has been successfully changed.
      </p>

      <div style="
        background:#ecfdf5;
        border:1px solid #a7f3d0;
        border-radius:12px;
        padding:18px;
        margin:25px 0;
      ">
        <p style="
          margin:0;
          color:#065f46;
          font-size:14px;
          line-height:1.7;
        ">
          <strong>Security Notice:</strong><br/>
          If you made this change, no further action is required.
        </p>
      </div>

      <div style="
        background:#fef2f2;
        border:1px solid #fecaca;
        border-radius:12px;
        padding:18px;
      ">
        <p style="
          margin:0;
          color:#991b1b;
          font-size:14px;
          line-height:1.7;
        ">
          If you did not change your password, please reset it immediately and contact support as your account may have been compromised.
        </p>
      </div>

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