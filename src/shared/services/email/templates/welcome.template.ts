export const welcomeTemplate = (username: string, email: string) => `
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

      <!-- Welcome Icon -->
      <div style="
        width:58px;
        height:58px;
        margin:0 auto 18px;
        border:1px solid rgba(129,140,248,0.20);
        border-radius:15px;
        background:rgba(99,102,241,0.10);
        text-align:center;
        line-height:58px;
        font-size:25px;
      ">
        ✨
      </div>

      <h1 style="
        margin:0;
        color:#ffffff;
        font-size:26px;
        line-height:1.3;
        font-weight:700;
        letter-spacing:-0.4px;
      ">
        Welcome to Habitify
      </h1>

      <p style="
        margin:10px 0 0;
        color:#9ca3af;
        font-size:13px;
        line-height:1.6;
      ">
        Your journey toward better habits starts today.
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
        We're excited to have you here. Habitify is designed
        to help you build meaningful habits, stay consistent,
        and make steady progress toward the person you want
        to become.
      </p>


      <!-- =================================================
           ACCOUNT CREATED
      ================================================== -->

      <div style="
        margin-top:26px;
        padding:16px 17px;
        border:1px solid #e0e7ff;
        border-radius:12px;
        background:#f8f9ff;
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
                ✓
              </div>
            </td>

            <td valign="top">

              <p style="
                margin:0 0 3px;
                color:#4338ca;
                font-size:13px;
                font-weight:700;
              ">
                Your account is ready
              </p>

              <p style="
                margin:0;
                color:#667085;
                font-size:12px;
                line-height:1.6;
              ">
                Your Habitify account has been successfully
                created and you're ready to get started.
              </p>

            </td>

          </tr>
        </table>

      </div>


      <!-- =================================================
           ACCOUNT DETAILS
      ================================================== -->

      <div style="
        margin-top:12px;
        padding:16px 17px;
        border:1px solid #eaecf0;
        border-radius:12px;
        background:#fafafa;
      ">

        <p style="
          margin:0 0 10px;
          color:#475467;
          font-size:11px;
          font-weight:700;
          letter-spacing:0.8px;
          text-transform:uppercase;
        ">
          Account Details
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
              padding:5px 0;
              color:#98a2b3;
              font-size:12px;
              width:90px;
            ">
              Username
            </td>

            <td style="
              padding:5px 0;
              color:#344054;
              font-size:12px;
              font-weight:600;
            ">
              ${username}
            </td>
          </tr>

          <tr>
            <td style="
              padding:5px 0;
              color:#98a2b3;
              font-size:12px;
            ">
              Email
            </td>

            <td style="
              padding:5px 0;
              color:#344054;
              font-size:12px;
              font-weight:600;
              word-break:break-word;
            ">
              ${email}
            </td>
          </tr>

        </table>

      </div>


      <!-- =================================================
           GET STARTED
      ================================================== -->

      <div style="
        margin-top:26px;
        text-align:center;
      ">

        <p style="
          margin:0 0 14px;
          color:#344054;
          font-size:13px;
          font-weight:600;
        ">
          Ready to build your first habit?
        </p>

        <a
          href="https://habitify.in"
          style="
            display:inline-block;
            padding:12px 22px;
            border-radius:11px;
            background:#4f46e5;
            color:#ffffff;
            font-size:12px;
            font-weight:700;
            text-decoration:none;
          "
        >
          Get Started
        </a>

      </div>


      <!-- =================================================
           MOTIVATIONAL MESSAGE
      ================================================== -->

      <div style="
        margin-top:26px;
        padding:18px;
        border:1px solid #e0e7ff;
        border-radius:12px;
        background:#fafbff;
        text-align:center;
      ">

        <p style="
          margin:0;
          color:#4f46e5;
          font-size:14px;
          line-height:1.7;
          font-weight:600;
        ">
          “Small steps every day lead to remarkable
          results over time.”
        </p>

        <p style="
          margin:8px 0 0;
          color:#98a2b3;
          font-size:10px;
        ">
          Your Habitify journey starts with one step.
        </p>

      </div>

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
        We're glad to have you with us.
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
`