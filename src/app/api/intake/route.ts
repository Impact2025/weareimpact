import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { sendEmail } from "@/lib/email/send";
import { INTAKE_GROUPS } from "@/lib/intake/questions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const dynamic = "force-dynamic";

interface IntakeAnswers {
  [questionId: string]: string;
}

function questionText(questionId: string): string {
  for (const group of INTAKE_GROUPS) {
    const question = group.questions.find((q) => q.id === questionId);
    if (question) return question.text;
  }
  return questionId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, organisation, answers, durationSeconds, honeypot } = body as {
      name: string;
      email: string;
      phone?: string;
      organisation?: string;
      answers: IntakeAnswers;
      durationSeconds?: number;
      honeypot?: string;
    };

    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name || !email || !answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: "Naam, e-mail en antwoorden zijn verplicht" },
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
    const safeDuration = typeof durationSeconds === "number" ? Math.round(durationSeconds) : null;

    const result = await sql`
      INSERT INTO intake_submissions (name, email, phone, organisation, answers, duration_seconds)
      VALUES (
        ${trimmedName},
        ${trimmedEmail},
        ${trimmedPhone},
        ${trimmedOrganisation},
        ${JSON.stringify(answers)}::jsonb,
        ${safeDuration}
      )
      RETURNING id, created_at
    `;

    const answersHtml = Object.entries(answers)
      .filter(([, value]) => value && value.trim() !== "")
      .map(
        ([questionId, value]) => `
        <tr>
          <td style="padding:10px 0; color:#666; font-size:13px; vertical-align:top; width:45%;">${questionText(questionId)}</td>
          <td style="padding:10px 0; color:#1a1a1a; vertical-align:top;">${value.replace(/\n/g, "<br/>")}</td>
        </tr>`
      )
      .join("");

    await sendEmail({
      to: "v.munster@weareimpact.nl",
      subject: `Intake AgentOS/Iris: ${trimmedOrganisation || trimmedName}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Intake AgentOS/Iris</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8f9fa; padding:20px;">
  <div style="max-width:640px; margin:0 auto; background:#fff; border-radius:16px; padding:32px; border:1px solid #e9ecef;">
    <h2 style="margin-top:0; color:#1a1a1a;">Nieuwe intake AgentOS/Iris</h2>
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <tr><td style="padding:6px 0; color:#666; font-weight:500;">Naam</td><td style="padding:6px 0; color:#1a1a1a;">${trimmedName}</td></tr>
      <tr><td style="padding:6px 0; color:#666; font-weight:500;">E-mail</td><td style="padding:6px 0;"><a href="mailto:${trimmedEmail}" style="color:#005e9f;">${trimmedEmail}</a></td></tr>
      ${trimmedPhone ? `<tr><td style="padding:6px 0; color:#666; font-weight:500;">Telefoon</td><td style="padding:6px 0; color:#1a1a1a;">${trimmedPhone}</td></tr>` : ""}
      ${trimmedOrganisation ? `<tr><td style="padding:6px 0; color:#666; font-weight:500;">Organisatie</td><td style="padding:6px 0; color:#1a1a1a;">${trimmedOrganisation}</td></tr>` : ""}
      ${safeDuration ? `<tr><td style="padding:6px 0; color:#666; font-weight:500;">Tijd besteed</td><td style="padding:6px 0; color:#1a1a1a;">${Math.round(safeDuration / 60)} min</td></tr>` : ""}
    </table>
    <table style="width:100%; border-collapse:collapse; border-top:1px solid #e9ecef;">
      ${answersHtml}
    </table>
    <p style="margin-top:24px; font-size:14px; color:#666;">Open <a href="https://weareimpact.nl/admin" style="color:#005e9f;">het admin-dashboard</a> om deze intake te beheren.</p>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({ success: true, submission: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Intake submission error:", error);
    return NextResponse.json(
      { error: "Er is iets misgegaan. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
