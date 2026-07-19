import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServiceClient } from '@/lib/supabase-service';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    name,
    email,
    company,
    interest_type,
    message,
    product,
    source,
    _subject,
  } = body;

  // Validation
  if (!name || !email || !email.includes('@')) {
    return NextResponse.json({ error: 'Name and valid email required', ok: false }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  // 1️⃣ Store in Supabase
  let dbError: string | null = null;
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('contacts').insert({
      name,
      email,
      company,
      interest_type,
      message,
      product,
      source,
      submitted_at: submittedAt,
    });
    if (error) {
      dbError = error.message;
      console.error('Supabase insert failed:', error);
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Unknown DB error';
    console.error('Supabase client error:', e);
  }

  // 2️⃣ Auto-reply to prospect (branded, professional)
  let autoReplyError: string | null = null;
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'BlackCat Robotics <hello@blackcatrobotics.com>',
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); border-radius: 12px; font-weight: 800; font-size: 18px; color: white; line-height: 48px;">BC</div>
          </div>
          <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px; font-weight: 700;">Thanks for contacting BlackCat Robotics</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">We received your inquiry about <strong>${interest_type || 'our platform'}</strong>. Our team reviews every submission and responds within <strong>24 hours</strong> — often much sooner.</p>
          
          <div style="margin: 32px 0; padding: 24px; background: #fafafa; border-radius: 12px; border-left: 4px solid #ff6b35;">
            <p style="margin: 0; font-size: 14px; color: #666;"><strong>What happens next:</strong></p>
            <ul style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 2;">
              <li>Technical assessment of your requirements</li>
              <li>Custom recommendation (TechMedix, HABITAT, or fleet solution)</li>
              <li>Clear next steps and timeline</li>
            </ul>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">While you wait, you might find these useful:</p>
          <ul style="font-size: 15px; line-height: 2.2; color: #333;">
            <li><a href="https://dashboard.blackcatrobotics.com/knowledge" style="color: #ff6b35; text-decoration: none;">TechMedix Knowledge Base</a> — certifications, diagnostics, repair guides</li>
            <li><a href="https://blackcatrobotics.com" style="color: #ff6b35; text-decoration: none;">BlackCat Robotics</a> — platform overview &amp; fleet solutions</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 13px; color: #888; text-align: center;">— The BlackCat Robotics Team<br />
            <a href="https://blackcatrobotics.com" style="color: #888;">blackcatrobotics.com</a> · 
            <a href="https://dashboard.blackcatrobotics.com" style="color: #888;">TechMedix Dashboard</a>
          </p>
        </div>
      `,
    });
  } catch (e) {
    autoReplyError = e instanceof Error ? e.message : 'Auto-reply failed';
    console.error('Resend auto-reply failed:', e);
  }

  // 3️⃣ SMS alert to Megan (iMessage via Twilio) — instant push, no Mac needed
  let smsError: string | null = null;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER && process.env.LEAD_ALERT_TO) {
    const interestLabel = interest_type || 'General Inquiry';
    const companyLabel = company || '—';
    const productLabel = product || 'core_platform';
    const body = `🚨 New BlackCat lead: ${name} (${email})${companyLabel !== '—' ? ' @ ' + companyLabel : ''} — ${interestLabel} / ${productLabel}`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams({
      To: process.env.LEAD_ALERT_TO,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: body.slice(0, 1600),
    });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        },
        body: params.toString(),
      });
      if (!res.ok) {
        const txt = await res.text();
        smsError = `Twilio SMS failed: ${res.status} ${txt.slice(0, 200)}`;
        console.error(smsError);
      }
    } catch (e) {
      smsError = e instanceof Error ? e.message : 'Twilio fetch failed';
      console.error('Twilio SMS error:', e);
    }
  } else {
    smsError = 'Twilio env vars not configured';
    console.warn('Twilio env vars not configured — lead SMS skipped');
  }

  // 4️⃣ Discord notification to you (instant push) — kept as fallback if webhook set
  let discordError: string | null = null;
  if (process.env.DISCORD_WEBHOOK_URL) {
    const interestLabel = interest_type || 'General Inquiry';
    const productLabel = product || 'core_platform';
    const companyLabel = company || '—';
    const messagePreview = message ? message.slice(0, 800) : '—';

    const embed = {
      title: `🚨 New Lead: ${interestLabel}`,
      color: 0xff6b35,
      fields: [
        { name: 'Name', value: name, inline: true },
        { name: 'Email', value: email, inline: true },
        { name: 'Company', value: companyLabel, inline: true },
        { name: 'Product', value: productLabel, inline: true },
        { name: 'Source', value: source || 'website', inline: true },
        { name: 'Interest', value: interestLabel, inline: true },
        { name: 'Message', value: messagePreview },
      ],
      footer: { text: `BlackCat Robotics • ${new Date().toISOString()}` },
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
      if (!res.ok) {
        const txt = await res.text();
        discordError = `Discord webhook failed: ${res.status} ${txt}`;
        console.error(discordError);
      }
    } catch (e) {
      discordError = e instanceof Error ? e.message : 'Discord fetch failed';
      console.error('Discord webhook error:', e);
    }
  }

  return NextResponse.json({
    ok: true,
    dbError,
    autoReplyError,
    smsError,
    discordError,
  });
}