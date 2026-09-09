-- Cosmetic/structural signature updates:
--   1. Rounded corners moved onto the inner <td> (more reliably respected
--      than a border-radius on the outer <table> itself across clients).
--   2. LinkedIn icon is now the real LinkedIn mark image instead of a
--      hand-built circle+letter, linked to the employee's profile URL.
--   3. The office address is no longer hardcoded — it's a per-employee
--      field ({{address}}) since it differs by location. This also removes
--      the old duplicated address block.
--   4. Fixed overall width (600px content area) with the name/job-title
--      forced to a single line via white-space:nowrap, so the signature
--      renders the same size for every employee regardless of name length.

alter table public.profiles add column if not exists address text;

update public.signature_templates
set html = '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
  <tr>
    <td style="border:2px solid #b97134;border-radius:16px;padding:24px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td valign="top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="86" valign="top" style="padding-right:18px;">
                  <img src="{{logo_url}}" width="76" height="76" alt="Clayworks" style="display:block;border:0;" />
                </td>
                <td width="4" style="background-color:#b97134;font-size:0;line-height:0;" valign="top">&nbsp;</td>
                <td valign="top" style="padding-left:20px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#1a1a1a;padding-bottom:2px;white-space:nowrap;">{{full_name}}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#b97134;padding-bottom:14px;white-space:nowrap;">{{job_title}}</td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="32" height="32" valign="middle">
                              <a href="{{linkedin_url}}" target="_blank" style="display:block;">
                                <img src="https://tools.clayworks.space/linkedin-icon.webp" width="32" height="32" alt="LinkedIn" style="display:block;border:0;border-radius:6px;" />
                              </a>
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
                        {{address}}
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
            <img src="{{banner_url}}" width="600" height="150" alt="Clayworks — Premium Coworking & Managed Offices" style="display:block;border:0;width:600px;height:150px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>'
where is_active = true;
