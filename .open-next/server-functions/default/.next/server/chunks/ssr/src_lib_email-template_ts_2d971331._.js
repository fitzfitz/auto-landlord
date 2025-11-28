module.exports=[78683,a=>{"use strict";function b(a,b){return`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${a}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background-color: #000000; padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px; }
          .footer { background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
          .button { display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AutoLandlord</h1>
          </div>
          <div class="content">
            ${b}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AutoLandlord. All rights reserved.</p>
            <p>123 Property Lane, Real Estate City, RE 12345</p>
          </div>
        </div>
      </body>
    </html>
  `}a.s(["generateEmailHtml",()=>b])}];

//# sourceMappingURL=src_lib_email-template_ts_2d971331._.js.map