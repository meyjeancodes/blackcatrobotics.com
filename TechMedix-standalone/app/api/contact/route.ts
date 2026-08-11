import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServiceClient } from '@/lib/supabase-service';

// Canonical lead inbox. Matches the Formspree endpoint already used by the
// client-side forms (InsightCTA, PlanUpsell, public/index.html) so every lead
// lands in the same place. Override per-environment via env if needed.
const FORMSPREE_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/xreyrndq';

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

  // 3️⃣ Deliver the lead to Formspree (canonical inbox for every BlackCat lead).
  // This is the same endpoint the client-side forms post to, so all leads
  // (Acquire quotes, insights, plan upsells) land in one place. Failures here
  // are surfaced, not swallowed — a silent lead pipeline is worse than a loud one.
  let formspreeError: string | null = null;
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name,
        email,
        company: company || '',
        interest_type: interest_type || 'Contact form',
        message: message || '',
        product: product || '',
        source: source || 'blackcat_website',
        _subject:
          _subject || `New lead — ${name} (${email})${company ? ' @ ' + company : ''}`,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      formspreeError = `Formspree failed: ${res.status} ${txt.slice(0, 200)}`;
      console.error(formspreeError);
    }
  } catch (e) {
    formspreeError = e instanceof Error ? e.message : 'Formspree fetch failed';
    console.error('Formspree delivery error:', e);
  }

  // If every delivery channel failed, respond with an error so the client shows
  // a retry state instead of a false "sent". Supabase (CRM) + Resend (prospect
  // auto-reply) + Formspree (our inbox) — partial success still counts as ok.
  const deliveryFailed = Boolean(formspreeError && autoReplyError && dbError);

  return NextResponse.json({
    ok: !deliveryFailed,
    dbError,
    autoReplyError,
    formspreeError,
  }, { status: deliveryFailed ? 502 : 200 });
}