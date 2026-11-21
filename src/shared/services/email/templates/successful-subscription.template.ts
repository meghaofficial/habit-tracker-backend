export const subsSuccTemplate = (
  email: string,
  startDate: Date,
  endDate: Date
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

      <!-- Success Icon -->
      <div style="
        width:58px;
        height:58px;
        margin:0 auto 18px;
        border:1px solid rgba(52,211,153,0.22);
        border-radius:15px;
        background:rgba(16,185,129,0.10);
        text-align:center;
        line-height:58px;
        font-size:24px;
      ">
        ✓
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:26px;
        line-height:1.3;
        font-weight:700;
        letter-spacing:-0.4px;
      ">
        Subscription Activated
      </h1>

      <p style="
        margin:10px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.6;
      ">
        Your Habitify membership is now active.
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
        Payment successful 🎉
      </h2>

      <p style="
        margin:0;
        color:#667085;
        font-size:14px;
        line-height:1.8;
      ">
        Your subscription payment has been successfully
        processed. Your premium access is now available
        on your Habitify account.
      </p>


      <!-- =================================================
           SUCCESS MESSAGE
      ================================================== -->

      <div style="
        margin-top:26px;
        padding:16px 17px;
        border:1px solid #a7f3d0;
        border-radius:12px;
        background:#ecfdf5;
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
                background:#d1fae5;
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
                margin:0 0 3px;
                color:#047857;
                font-size:13px;
                font-weight:700;
              ">
                Subscription confirmed
              </p>

              <p style="
                margin:0;
                color:#4b7a6b;
                font-size:12px;
                line-height:1.6;
              ">
                Your payment was successful and your
                membership period has been activated.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           SUBSCRIPTION DETAILS
      ================================================== -->

      <div style="
        margin-top:12px;
        padding:18px;
        border:1px solid #e0e7ff;
        border-radius:12px;
        background:#fafbff;
      ">

        <p style="
          margin:0 0 14px;
          color:#475467;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.8px;
          text-transform:uppercase;
        ">
          Subscription Details
        </p>

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="100%"
        >

          <tr>

            <td style="
              padding:7px 0;
              color:#98a2b3;
              font-size:12px;
              width:100px;
            ">
              Account
            </td>

            <td style="
              padding:7px 0;
              color:#344054;
              font-size:12px;
              font-weight:600;
              word-break:break-word;
            ">
              ${email}
            </td>

          </tr>

          <tr>

            <td style="
              padding:7px 0;
              color:#98a2b3;
              font-size:12px;
            ">
              Starts
            </td>

            <td style="
              padding:7px 0;
              color:#344054;
              font-size:12px;
              font-weight:600;
            ">
              ${startDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </td>

          </tr>

          <tr>

            <td style="
              padding:7px 0;
              color:#98a2b3;
              font-size:12px;
            ">
              Expires
            </td>

            <td style="
              padding:7px 0;
              color:#4f46e5;
              font-size:12px;
              font-weight:700;
            ">
              ${endDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </td>

          </tr>

        </table>

      </div>


      <!-- =================================================
           ACCESS MESSAGE
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
              ">
                ✦
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 3px;
                color:#475467;
                font-size:13px;
                font-weight:700;
              ">
                Premium access unlocked
              </p>

              <p style="
                margin:0;
                color:#667085;
                font-size:12px;
                line-height:1.7;
              ">
                You can now continue using your premium
                Habitify features throughout your active
                subscription period.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           CLOSING
      ================================================== -->

      <p style="
        margin:24px 0 0;
        color:#98a2b3;
        font-size:12px;
        line-height:1.7;
        text-align:center;
      ">
        Thank you for choosing Habitify.
        Keep building habits that last.
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
        This is an automated subscription confirmation email.
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