module.exports=[27607,a=>{"use strict";var b=a.i(37936);a.i(44721);var c=a.i(5246);async function d(){(await (0,c.cookies)()).delete(`__clerk_invalidate_cache_cookie_${Date.now()}`)}(0,a.i(13095).ensureServerEntryExports)([d]),(0,b.registerServerReference)(d,"7f9a9e295fe46e9b2e4aba1171fe667933b9a93f4f",null),a.s(["invalidateCacheAction",()=>d])},91,a=>{"use strict";var b=a.i(37936),c=a.i(9307),d=a.i(29173),e=a.i(18558);a.i(70396);var f=a.i(73727),g=a.i(13095);let h=new d.PrismaClient;async function i(b){let d=await (0,c.getOrCreateUser)();if(!d)throw Error("Unauthorized");let g=b.get("email"),i=b.get("propertyId"),j=b.get("leaseStart"),k=b.get("leaseEnd"),l=b.get("name");if(!g||!i||!j||!k)throw Error("Missing required fields");let m=await h.property.findFirst({where:{id:i,landlordId:d.id}});if(!m)throw Error("Property not found");let n=await h.user.findUnique({where:{email:g}});n||(n=await h.user.create({data:{email:g,name:l||g.split("@")[0],role:"TENANT"}})),await h.tenant.create({data:{userId:n.id,propertyId:i,leaseStart:new Date(j),leaseEnd:new Date(k)}});let{sendEmail:o}=await a.A(74019),{generateEmailHtml:p}=await a.A(23070);await o({to:g,subject:"You've been invited to rent a property",html:p("Welcome to AutoLandlord",`
        <h2 style="margin-top: 0;">You've been invited to join AutoLandlord!</h2>
        <p>Hello,</p>
        <p>You have been officially invited to rent the property located at <strong>${m.address}</strong>.</p>
        <p>AutoLandlord is your new home for managing your tenancy. Through our secure portal, you will be able to:</p>
        <ul>
          <li>View your lease details and documents</li>
          <li>Submit maintenance requests directly to your landlord</li>
          <li>View payment history and upcoming rent</li>
        </ul>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; margin-bottom: 12px;">Lease Details</h3>
          <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${m.address}</p>
          <p style="margin: 0 0 8px 0;"><strong>Lease Start:</strong> ${j}</p>
          <p style="margin: 0;"><strong>Lease End:</strong> ${k}</p>
        </div>

        <p>To get started, please click the button below to access your tenant portal. You can create your account using this email address.</p>
        
        <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/sign-in" class="button" style="color: #ffffff;">Access Tenant Portal</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact your landlord directly.</p>
      `)}),await h.property.update({where:{id:i},data:{status:"OCCUPIED"}}),(0,e.revalidatePath)("/dashboard/tenants"),(0,f.redirect)("/dashboard/tenants")}async function j(b){let d=await (0,c.getOrCreateUser)();if(!d)throw Error("Unauthorized");let e=await h.tenant.findUnique({where:{id:b},include:{user:!0,property:!0}});if(!e)throw Error("Tenant not found");if(e.property.landlordId!==d.id)throw Error("Unauthorized");let{sendEmail:f}=await a.A(74019),{generateEmailHtml:g}=await a.A(23070),i=await f({to:e.user.email,subject:"Invitation Reminder: Rent Property",html:g("Invitation Reminder",`
        <h2 style="margin-top: 0;">Reminder: You've been invited to join AutoLandlord!</h2>
        <p>Hello,</p>
        <p>This is a friendly reminder that you have been invited to rent the property located at <strong>${e.property.address}</strong>.</p>
        <p>We noticed you haven't set up your account yet. By joining AutoLandlord, you'll get access to:</p>
        <ul>
          <li>Digital lease signing and document storage</li>
          <li>Easy online rent payments</li>
          <li>Direct maintenance request tracking</li>
        </ul>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; margin-bottom: 12px;">Lease Details</h3>
          <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${e.property.address}</p>
          <p style="margin: 0 0 8px 0;"><strong>Lease Start:</strong> ${e.leaseStart.toLocaleDateString()}</p>
          <p style="margin: 0;"><strong>Lease End:</strong> ${e.leaseEnd.toLocaleDateString()}</p>
        </div>

        <p>Don't miss out on streamlining your rental experience. Click the button below to get started.</p>
        
        <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/sign-in" class="button" style="color: #ffffff;">Access Tenant Portal</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you believe this email was sent in error, please ignore it.</p>
      `)});if(!i.success)throw Error("Failed to send email: "+JSON.stringify(i.error));return{success:!0}}(0,g.ensureServerEntryExports)([i,j]),(0,b.registerServerReference)(i,"400bb9c369c9cbea4a21d03b2051881d5ee0069693",null),(0,b.registerServerReference)(j,"402783ee75631ec24245c2437abc4bae37de9cc826",null),a.s(["inviteTenant",()=>i,"resendInvitation",()=>j])},31730,a=>{"use strict";var b=a.i(26022),c=a.i(27607),d=a.i(85978),e=a.i(91);a.s([],80938),a.i(80938),a.s(["402783ee75631ec24245c2437abc4bae37de9cc826",()=>e.resendInvitation,"7f0be6fbd2daf96ae7ef7c7462a2c028c9cd09c91a",()=>b.createOrReadKeylessAction,"7f0de2a40e1306a68d7c435b901821d38bbc29d0a6",()=>d.formatMetadataHeaders,"7f2b814ab59841a49c882426af2ce6e10e2bdedec0",()=>b.syncKeylessConfigAction,"7f8bc9947cc91baf32cddfac4b6fdd237e047e4c55",()=>b.deleteKeylessAction,"7f9a9e295fe46e9b2e4aba1171fe667933b9a93f4f",()=>c.invalidateCacheAction,"7faef910ecfc0640f23543237e6186af380ef7958d",()=>d.collectKeylessMetadata,"7fced5d1e377a35f45f439bde0e14c95cc51825d6b",()=>b.detectKeylessEnvDriftAction],31730)},74019,a=>{a.v(b=>Promise.all(["server/chunks/ssr/_a5ccb11b._.js"].map(b=>a.l(b))).then(()=>b(28725)))},23070,a=>{a.v(b=>Promise.all(["server/chunks/ssr/src_lib_email-template_ts_2d971331._.js"].map(b=>a.l(b))).then(()=>b(78683)))}];

//# sourceMappingURL=_695d93af._.js.map