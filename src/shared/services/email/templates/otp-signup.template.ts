export const otpTemplate = (
  username: string,
  otp: string
) => `
<div style="
  margin:0;
  padding:40px 20px;
  background:#f5f6fa;
  font-family:Arial,Helvetica,sans-serif;
  color:#111827;
">

  <!-- Main Container -->
  <div style="
    width:100%;
    max-width:600px;
    margin:0 auto;
    background:#ffffff;
    border:1px solid #e8eaf0;
    border-radius:18px;
    overflow:hidden;
  ">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <div style="
      padding:36px 30px;
      background:#17182b;
      text-align:center;
    ">

      <!-- Brand -->
      <div style="
        display:inline-block;
        margin-bottom:24px;
        padding:8px 14px;
        border:1px solid rgba(129,140,248,0.22);
        border-radius:10px;
        background:rgba(99,102,241,0.10);
      ">
        <span style="
          color:#a5b4fc;
          font-size:12px;
          font-weight:700;
          letter-spacing:1.5px;
        ">
          HABITIFY
        </span>
      </div>

      <!-- Verification Icon -->
      <div style="
        width:58px;
        height:58px;
        margin:0 auto 18px;
        border:1px solid rgba(129,140,248,0.20);
        border-radius:15px;
        background:rgba(99,102,241,0.10);
        text-align:center;
        line-height:58px;
        font-size:24px;
      ">
        ✉️
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:26px;
        line-height:1.3;
        font-weight:700;
        letter-spacing:-0.4px;
      ">
        Verify Your Account
      </h1>

      <p style="
        margin:10px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.6;
      ">
        One quick step to get started with Habitify.
      </p>

    </div>


    <!-- =====================================================
         BODY
    ====================================================== -->

    <div style="
      padding:34px 30px 32px;
    ">

      <h2 style="
        margin:0 0 12px;
        color:#171923;
        font-size:20px;
        line-height:1.4;
        font-weight:700;
      ">
        Hello ${username},
      </h2>

      <p style="
        margin:0;
        color:#667085;
        font-size:14px;
        line-height:1.8;
      ">
        Use the verification code below to confirm your
        email address and complete your Habitify account
        verification.
      </p>


      <!-- =================================================
           OTP SECTION
      ================================================== -->

      <div style="
        margin:28px 0 24px;
        padding:22px 20px;
        border:1px solid #e0e7ff;
        border-radius:14px;
        background:#fafbff;
        text-align:center;
      ">

        <p style="
          margin:0 0 13px;
          color:#667085;
          font-size:10px;
          font-weight:700;
          letter-spacing:1.5px;
          text-transform:uppercase;
        ">
          Verification Code
        </p>

        <div style="
          display:inline-block;
          padding:14px 23px;
          border:1px dashed #818cf8;
          border-radius:11px;
          background:#eef2ff;
        ">
          <span style="
            color:#4f46e5;
            font-size:30px;
            line-height:1;
            font-weight:700;
            letter-spacing:7px;
          ">
            ${otp}
          </span>
        </div>

        <p style="
          margin:13px 0 0;
          color:#98a2b3;
          font-size:11px;
        ">
          Enter this code in Habitify to continue.
        </p>

      </div>


      <!-- =================================================
           EXPIRY NOTICE
      ================================================== -->

      <div style="
        padding:15px 16px;
        border:1px solid #fde68a;
        border-radius:12px;
        background:#fffbeb;
      ">

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="100%"
        >
          <tr>

            <td
              valign="top"
              style="
                width:32px;
                padding-right:10px;
              "
            >
              <div style="
                width:28px;
                height:28px;
                border-radius:8px;
                background:#fef3c7;
                color:#d97706;
                text-align:center;
                line-height:28px;
                font-size:14px;
              ">
                ⏱
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 3px;
                color:#92400e;
                font-size:13px;
                font-weight:700;
              ">
                Code expires soon
              </p>

              <p style="
                margin:0;
                color:#9a6b32;
                font-size:12px;
                line-height:1.6;
              ">
                This verification code is valid for
                <strong>10 minutes</strong>.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           SECURITY NOTICE
      ================================================== -->

      <div style="
        margin-top:12px;
        padding:15px 16px;
        border:1px solid #eaecf0;
        border-radius:12px;
        background:#fafafa;
      ">

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="100%"
        >
          <tr>

            <td
              valign="top"
              style="
                width:32px;
                padding-right:10px;
              "
            >
              <div style="
                width:28px;
                height:28px;
                border-radius:8px;
                background:#eef2ff;
                color:#4f46e5;
                text-align:center;
                line-height:28px;
                font-size:13px;
                font-weight:bold;
              ">
                i
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 3px;
                color:#475467;
                font-size:13px;
                font-weight:700;
              ">
                Didn't request this code?
              </p>

              <p style="
                margin:0;
                color:#667085;
                font-size:12px;
                line-height:1.7;
              ">
                You can safely ignore this email. Your account
                will not be verified unless this code is entered
                successfully.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           SECURITY REMINDER
      ================================================== -->

      <p style="
        margin:24px 0 0;
        color:#98a2b3;
        font-size:12px;
        line-height:1.7;
        text-align:center;
      ">
        For your security, never share this verification code
        with anyone.
      </p>

    </div>


    <!-- =====================================================
         FOOTER
    ====================================================== -->

    <div style="
      border-top:1px solid #eaecf0;
      padding:20px 25px;
      text-align:center;
      background:#fafafa;
    ">

      <p style="
        margin:0;
        color:#667085;
        font-size:12px;
        font-weight:600;
      ">
        Habitify
      </p>

      <p style="
        margin:6px 0 0;
        color:#98a2b3;
        font-size:11px;
        line-height:1.6;
      ">
        This is an automated account verification email.
        Please do not reply to this email.
      </p>

      <p style="
        margin:10px 0 0;
        color:#b0b7c3;
        font-size:10px;
      ">
        © 2026 Habitify. All rights reserved.
      </p>

    </div>

  </div>

</div>
`;