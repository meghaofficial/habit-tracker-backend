export const passwordChangedTemplate = (
  username: string
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
      padding:32px 30px;
      background:#17182b;
      text-align:center;
    ">

      <!-- Logo / Brand -->
      <div style="
        display:inline-block;
        margin-bottom:22px;
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

      <!-- Success Icon -->
      <div style="
        width:56px;
        height:56px;
        margin:0 auto 18px;
        border:1px solid rgba(52,211,153,0.20);
        border-radius:14px;
        background:rgba(52,211,153,0.08);
        text-align:center;
        line-height:56px;
        font-size:24px;
        color:#34d399;
      ">
        ✓
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:25px;
        line-height:1.3;
        font-weight:700;
        letter-spacing:-0.3px;
      ">
        Password Updated
      </h1>

      <p style="
        margin:9px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.6;
      ">
        Your account security details have been updated.
      </p>

    </div>


    <!-- =====================================================
         BODY
    ====================================================== -->

    <div style="
      padding:34px 30px 30px;
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
        Your Habitify account password was successfully
        changed. You can now use your new password the next
        time you sign in.
      </p>


      <!-- =================================================
           SUCCESS NOTICE
      ================================================== -->

      <div style="
        margin-top:25px;
        padding:16px 17px;
        border:1px solid #d1fae5;
        border-radius:12px;
        background:#f0fdf9;
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
                background:#dcfce7;
                color:#059669;
                text-align:center;
                line-height:28px;
                font-size:14px;
                font-weight:bold;
              ">
                ✓
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 4px;
                color:#047857;
                font-size:13px;
                font-weight:700;
              ">
                Security update successful
              </p>

              <p style="
                margin:0;
                color:#4b7c6d;
                font-size:12px;
                line-height:1.7;
              ">
                If you made this change, no further action
                is required.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           SECURITY WARNING
      ================================================== -->

      <div style="
        margin-top:12px;
        padding:16px 17px;
        border:1px solid #fee2e2;
        border-radius:12px;
        background:#fff8f8;
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
                background:#fee2e2;
                color:#dc2626;
                text-align:center;
                line-height:28px;
                font-size:14px;
                font-weight:bold;
              ">
                !
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 4px;
                color:#b91c1c;
                font-size:13px;
                font-weight:700;
              ">
                Didn't make this change?
              </p>

              <p style="
                margin:0;
                color:#8b5c5c;
                font-size:12px;
                line-height:1.7;
              ">
                Your account may have been compromised. Reset
                your password immediately and contact our
                support team for assistance.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           SUPPORT
      ================================================== -->

      <p style="
        margin:26px 0 0;
        color:#98a2b3;
        font-size:12px;
        line-height:1.7;
        text-align:center;
      ">
        If you have any questions about your account,
        our support team is here to help.
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
        This is an automated security notification.
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