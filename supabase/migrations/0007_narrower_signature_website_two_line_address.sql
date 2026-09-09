-- Response to real-world Outlook testing:
--   1. The signature (600px content + border/padding, ~652px total) was
--      too wide for a typical Outlook compose pane. Overall width — and the
--      promo banner along with it — is reduced to a 500px content area
--      (~544px including border/padding), roughly a 17% reduction, with
--      every element (logo, text, icon, banner) scaled down to match.
--   2. Added a fixed company website line (https://www.clayworks.space/) —
--      hardcoded in the template HTML itself, not a per-employee field, so
--      it's identical for every user and not editable from the builder.
--   3. The free-text "address" field is replaced by two separate fields,
--      address_line1 and address_line2. Each renders on its own hardcoded
--      line in the template, so the address is always exactly two lines —
--      never fewer, never more — regardless of what the employee types.

alter table public.profiles add column if not exists address_line1 text;
alter table public.profiles add column if not exists address_line2 text;

-- Best-effort backfill from the old single `address` field, if present:
-- first line (if it contains a break) becomes line 1, the rest becomes
-- line 2; otherwise the whole thing goes on line 1.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'address'
  ) then
    update public.profiles
    set
      address_line1 = coalesce(nullif(split_part(address, chr(10), 1), ''), address_line1),
      address_line2 = case
        when position(chr(10) in address) > 0
          then nullif(trim(both chr(10) from substring(address from position(chr(10) in address) + 1)), '')
        else address_line2
      end
    where address is not null and address_line1 is null and address_line2 is null;

    alter table public.profiles drop column address;
  end if;
end $$;

update public.signature_templates
set html = '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
  <tr>
    <td style="border:2px solid #b97134;border-radius:14px;padding:20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="500" style="width:500px;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td valign="top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="72" valign="top" style="padding-right:14px;">
                  <img src="{{logo_url}}" width="64" height="64" alt="Clayworks" style="display:block;border:0;" />
                </td>
                <td width="4" style="background-color:#b97134;font-size:0;line-height:0;" valign="top">&nbsp;</td>
                <td valign="top" style="padding-left:16px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#1a1a1a;padding-bottom:2px;white-space:nowrap;">{{full_name}}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#b97134;padding-bottom:12px;white-space:nowrap;">{{job_title}}</td>
                    </tr>
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="28" height="28" valign="middle">
                              <a href="{{linkedin_url}}" target="_blank" style="display:block;">
                                <img src="https://tools.clayworks.space/linkedin-icon.webp" width="28" height="28" alt="LinkedIn" style="display:block;border:0;border-radius:6px;" />
                              </a>
                            </td>
                            <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333333;line-height:17px;" valign="middle">
                              <a href="tel:{{phone}}" style="color:#333333;text-decoration:none;">{{phone}}</a><br/>
                              <a href="mailto:{{email}}" style="color:#333333;text-decoration:none;">{{email}}</a><br/>
                              <a href="https://www.clayworks.space/" target="_blank" style="color:#333333;text-decoration:none;">www.clayworks.space</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6b6b6b;">
                        {{address_line1}}<br/>{{address_line2}}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="font-size:0;line-height:14px;">&nbsp;</td>
        </tr>
        <tr>
          <td>
            <img src="{{banner_url}}" width="500" height="125" alt="Clayworks — Premium Coworking & Managed Offices" style="display:block;border:0;width:500px;height:125px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>'
where is_active = true;
