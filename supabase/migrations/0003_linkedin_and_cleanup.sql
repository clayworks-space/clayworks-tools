-- Adds a per-employee LinkedIn profile URL and makes the signature's
-- LinkedIn icon a real link to it. Also drops department/centre from the
-- employee-facing form (columns are left in place — no data is lost, they
-- just aren't edited or shown anymore).

alter table public.profiles add column if not exists linkedin_url text;

update public.signature_templates
set html = '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td valign="top">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="86" valign="top" style="padding-right:18px;">
            <img src="{{logo_url}}" width="76" height="76" alt="Clayworks" style="display:block;border:0;" />
          </td>
          <td width="4" style="background-color:#b97134;font-size:0;line-height:0;" valign="top">&nbsp;</td>
          <td style="padding-left:20px;" valign="top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#1a1a1a;padding-bottom:2px;">{{full_name}}</td>
              </tr>
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#b97134;padding-bottom:14px;">{{job_title}}</td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="32" height="32" valign="middle" align="center" style="background-color:#0a66c2;border-radius:6px;">
                        <a href="{{linkedin_url}}" target="_blank" style="display:inline-block;width:32px;height:32px;line-height:32px;color:#ffffff;font-size:15px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;text-decoration:none;text-align:center;">in</a>
                      </td>
                      <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:19px;" valign="middle">
                        <a href="tel:{{phone}}" style="color:#333333;text-decoration:none;">{{phone}}</a><br/>
                        <a href="mailto:{{email}}" style="color:#333333;text-decoration:none;">{{email}}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b6b6b;">
                  3rd Floor, Site No. 74, Mass Complex, 15th Cross Rd,<br/>3rd Phase, J. P. Nagar, Bengaluru, Karnataka 560078
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-size:0;line-height:18px;">&nbsp;</td>
  </tr>
  <tr>
    <td>
      <img src="{{banner_url}}" width="600" height="150" alt="Clayworks — Premium Coworking & Managed Offices" style="display:block;border:0;max-width:600px;width:100%;height:auto;" />
    </td>
  </tr>
</table>'
where is_active = true;
