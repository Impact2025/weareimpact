import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { sendEmail } from "@/lib/email/send";

const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

export const dynamic = "force-dynamic";

// Demo aanvragen worden opgeslagen in contact_submissions met type='demo'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, organisation, teamSize, challenge, desiredDate, honeypot } = body;

    // Honeypot check
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validatie
    if (!name || !email || !organisation || !challenge) {
      return NextResponse.json(
        { error: "Naam, e-mail, organisatie en uitdaging zijn verplicht" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Geldig e-mailadres is verplicht" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone?.trim() || null;
    const trimmedOrganisation = organisation?.trim() || null;
    const trimmedTeamSize = teamSize ? parseInt(teamSize, 10) : null;
    const trimmedChallenge = challenge.trim();
    const trimmedDesiredDate = desiredDate || null;

    // Opslaan in database
    const result = await sql`
      INSERT INTO contact_submissions (name, email, phone, message, status)
      VALUES (
        ${trimmedName},
        ${trimmedEmail},
        ${trimmedPhone},
        ${`Demo aanvraag voor WeAreImpact
        
Organisatie: ${trimmedOrganisation}
Team grootte: ${trimmedTeamSize || "niet opgegeven"}
Uitdaging: ${trimmedChallenge}
Gewenste datum: ${trimmedDesiredDate || "niet opgegeven"}`.trim()},
        'demo'
      )
      RETURNING id, created_at
    `;

    // Stuur notificatie naar Vincent
    const datum = trimmedDesiredDate 
      ? new Date(trimmedDesiredDate).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
      : "nader te bepalen";

    await sendEmail({
      to: "v.munster@weareimpact.nl",
      subject: `Demo aanvraag: ${trimmedOrganisation}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Demo aanvraag</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8f9fa; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:16px; padding:32px; border:1px solid #e9ecef;">
    <h2 style="margin-top:0; color:#1a1a1a;">Nieuwe demo aanvraag</h2>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:8px 0; color:#666; font-weight:500;">Naam</td><td style="padding:8px 0; color:#1a1a1a;">${trimmedName}</td></tr>
      <tr><td style="padding:8px 0; color:#666; font-weight:500;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${trimmedEmail}" style="color:#005e9f;">${trimmedEmail}</a></td></tr>
      ${trimmedPhone ? `<tr><td style="padding:8px 0; color:#666; font-weight:500;">Telefoon</td><td style="padding:8px 0; color:#1a1a1a;">${trimmedPhone}</td></tr>` : ""}
      ${trimmedOrganisation ? `<tr><td style="padding:8px 0; color:#666; font-weight:500;">Organisatie</td><td style="padding:8px 0; color:#1a1a1a;">${trimmedOrganisation}</td></tr>` : ""}
      ${trimmedTeamSize ? `<tr><td style="padding:8px 0; color:#666; font-weight:500;">Team grootte</td><td style="padding:8px 0; color:#1a1a1a;">${trimmedTeamSize} personen</td></tr>` : ""}
      <tr><td style="padding:8px 0; color:#666; font-weight:500;">Uitdaging</td><td style="padding:8px 0; color:#1a1a1a;">${trimmedChallenge}</td></tr>
      <tr><td style="padding:8px 0; color:#666; font-weight:500;">Gewenste datum</td><td style="padding:8px 0; color:#1a1a1a;">${datum}</td></tr>
    </table>
    <p style="margin-top:24px; font-size:14px; color:#666;">Open <a href="https://weareimpact.nl/admin/contact" style="color:#005e9f;">contactbeheer</a> om deze aanvraag te beheren.</p>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true, submission: result[0] }, { status: 201 });

  } catch (error) {
    console.error("Demo aanvraag error:", error);
    return NextResponse.json(
      { error: "Er is iets misgegaan. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}