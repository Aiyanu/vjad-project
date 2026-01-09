// Email Templates for Vijad Projects

const baseStyles = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0046FF; padding-bottom: 20px; }
    .logo-img { max-width: 200px; height: auto; margin: 0 auto; display: block; }
    .content { padding: 20px 0; }
    .button { 
      display: inline-block; 
      background-color: #0046FF; 
      color: white !important; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: 600; 
      margin: 20px 0;
    }
    .button-container { text-align: center; margin: 30px 0; }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #eee; 
      font-size: 12px; 
      color: #999; 
      text-align: center;
    }
    .code-box {
      background-color: #f5f5f5;
      border: 2px dashed #0046FF;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #0046FF;
      letter-spacing: 8px;
    }
  </style>
`;

const getLogoUrl = () => {
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `${appUrl}/vijad-projects-dark.png`;
};

const headerWithLogo = `
  <div class="header">
    <img src="${getLogoUrl()}" alt="Vijad Projects" class="logo-img" />
  </div>
`;

export const emailTemplates = {
  // Email Verification Template
  verification: (
    name: string,
    verificationCode: string,
    verificationUrl: string
  ) => ({
    subject: "Verify Your Email - Vijad Projects",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            ${headerWithLogo}
            
            <div class="content">
              <h2 style="color: #333;">Welcome, ${name}!</h2>
              
              <p>Thank you for registering with Vijad Projects. To complete your registration, please verify your email address.</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your verification code is:</p>
                <div class="code">${verificationCode}</div>
              </div>
              
              <p style="color: #666; font-size: 14px;">Or click the button below to verify automatically:</p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #0046FF; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">
                This verification code will expire in <strong>10 minutes</strong>.
              </p>
            </div>
            
            <div class="footer">
              <p>If you didn't create an account with Vijad Projects, please ignore this email.</p>
              <p>© ${new Date().getFullYear()} Vijad Projects. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Vijad Projects!

Hello ${name},

Thank you for registering with Vijad Projects. To complete your registration, please verify your email address.

Your verification code is: ${verificationCode}

Or click this link to verify automatically:
${verificationUrl}

This verification code will expire in 10 minutes.

If you didn't create an account with Vijad Projects, please ignore this email.

© ${new Date().getFullYear()} Vijad Projects. All rights reserved.
    `,
  }),

  // Password Reset Template
  passwordReset: (name: string, resetUrl: string) => ({
    subject: "Password Reset Request - Vijad Projects",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            ${headerWithLogo}
            
            <div class="content">
              <h2 style="color: #333;">Reset Your Password</h2>
              
              <p>Hello ${name},</p>
              
              <p>We received a request to reset your password for your Vijad Projects account. Click the button below to create a new password:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #0046FF; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">
                This link will expire in <strong>1 hour</strong>.
              </p>
            </div>
            
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              <p>© ${new Date().getFullYear()} Vijad Projects. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Reset Your Password

Hello ${name},

We received a request to reset your password for your Vijad Projects account. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} Vijad Projects. All rights reserved.
    `,
  }),

  // Welcome Email (after verification)
  welcome: (name: string, dashboardUrl: string) => ({
    subject: "Welcome to Vijad Projects!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            ${headerWithLogo}
            
            <div class="content">
              <h2 style="color: #333;">Welcome to Vijad Projects!</h2>
              
              <p>Hello ${name},</p>
              
              <p>Your email has been verified successfully! We're excited to have you as part of our affiliate community.</p>
              
              <p><strong>What's Next?</strong></p>
              <ul style="line-height: 2;">
                <li>Complete your profile and bank details</li>
                <li>Get your unique referral link</li>
                <li>Start referring customers</li>
                <li>Earn 15% commission on every successful sale</li>
              </ul>
              
              <div class="button-container">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
              
              <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0046FF; margin: 20px 0;">
                <strong>💡 Tip:</strong> Update your bank details in settings to ensure smooth commission payouts.
              </p>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at <a href="mailto:support@vijadprojects.com" style="color: #0046FF;">support@vijadprojects.com</a></p>
              <p>© ${new Date().getFullYear()} Vijad Projects. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Vijad Projects!

Hello ${name},

Your email has been verified successfully! We're excited to have you as part of our affiliate community.

What's Next?
- Complete your profile and bank details
- Get your unique referral link
- Start referring customers
- Earn 15% commission on every successful sale

Visit your dashboard: ${dashboardUrl}

Tip: Update your bank details in settings to ensure smooth commission payouts.

Need help? Contact us at support@vijadprojects.com

© ${new Date().getFullYear()} Vijad Projects. All rights reserved.
    `,
  }),

  // Sale Notification to Affiliate
  //   saleNotification: (
  //     name: string,
  //     buyerName: string,
  //     projectName: string,
  //     saleAmount: string,
  //     commission: string,
  //     dashboardUrl: string
  //   ) => ({
  //     subject: "🎉 New Sale! Commission Earned - Vijad Projects",
  //     html: `
  //       <!DOCTYPE html>
  //       <html>
  //         <head>
  //           <meta charset="utf-8">
  //           <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //           ${baseStyles}
  //         </head>
  //         <body>
  //           <div class="container">
  //             <div class="header">
  //               <h1 class="logo">Vijad Projects</h1>
  //             </div>

  //             <div class="content">
  //               <h2 style="color: #0046FF;">🎉 Congratulations, ${name}!</h2>

  //               <p>You've earned a new commission! One of your referrals just made a purchase.</p>

  //               <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
  //                 <h3 style="margin-top: 0; color: #0046FF;">Sale Details</h3>
  //                 <table style="width: 100%; border-collapse: collapse;">
  //                   <tr>
  //                     <td style="padding: 8px 0; color: #666;">Buyer:</td>
  //                     <td style="padding: 8px 0; font-weight: bold;">${buyerName}</td>
  //                   </tr>
  //                   <tr>
  //                     <td style="padding: 8px 0; color: #666;">Project:</td>
  //                     <td style="padding: 8px 0; font-weight: bold;">${projectName}</td>
  //                   </tr>
  //                   <tr>
  //                     <td style="padding: 8px 0; color: #666;">Sale Amount:</td>
  //                     <td style="padding: 8px 0; font-weight: bold;">₦${saleAmount}</td>
  //                   </tr>
  //                   <tr style="border-top: 2px solid #0046FF;">
  //                     <td style="padding: 12px 0 8px 0; color: #666;">Your Commission:</td>
  //                     <td style="padding: 12px 0 8px 0; font-size: 24px; font-weight: bold; color: #0046FF;">₦${commission}</td>
  //                   </tr>
  //                 </table>
  //               </div>

  //               <div class="button-container">
  //                 <a href="${dashboardUrl}" class="button">View in Dashboard</a>
  //               </div>

  //               <p style="color: #666; font-size: 14px;">
  //                 Keep up the great work! Your commission will be processed according to our payment schedule.
  //               </p>
  //             </div>

  //             <div class="footer">
  //               <p>Questions about your commission? Contact us at <a href="mailto:support@vijadprojects.com" style="color: #0046FF;">support@vijadprojects.com</a></p>
  //               <p>© ${new Date().getFullYear()} Vijad Projects. All rights reserved.</p>
  //             </div>
  //           </div>
  //         </body>
  //       </html>
  //     `,
  //     text: `
  // 🎉 Congratulations, ${name}!

  // You've earned a new commission! One of your referrals just made a purchase.

  // Sale Details:
  // - Buyer: ${buyerName}
  // - Project: ${projectName}
  // - Sale Amount: ₦${saleAmount}
  // - Your Commission: ₦${commission}

  // Keep up the great work! Your commission will be processed according to our payment schedule.

  // View in Dashboard: ${dashboardUrl}

  // Questions about your commission? Contact us at support@vijadprojects.com

  // © ${new Date().getFullYear()} Vijad Projects. All rights reserved.
  //     `,
  //   }),

  // Admin Notification Template
  adminNotification: (
    subject: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ) => ({
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${getLogoUrl()}" alt="Vijad Projects" class="logo-img" />
              <p style="color: #666; margin: 10px 0 0 0;">Admin Notification</p>
            </div>
            
            <div class="content">
              <h2 style="color: #333;">${title}</h2>
              
              <p>${message}</p>
              
              ${
                actionUrl && actionText
                  ? `
                <div class="button-container">
                  <a href="${actionUrl}" class="button">${actionText}</a>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Vijad Projects Admin System</p>
              <p>© ${new Date().getFullYear()} Vijad Projects. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
${title}

${message}

${actionUrl ? `View details: ${actionUrl}` : ""}

This is an automated notification from Vijad Projects Admin System
© ${new Date().getFullYear()} Vijad Projects. All rights reserved.
    `,
  }),
};
