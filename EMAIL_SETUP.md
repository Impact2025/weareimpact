# Email Setup Guide

Deze applicatie gebruikt [Resend](https://resend.com) voor het versturen van booking confirmation emails.

## Stap 1: Resend Account Aanmaken

1. Ga naar [resend.com](https://resend.com)
2. Maak een gratis account aan
3. Verifieer je e-mailadres

## Stap 2: Domein Verificatie

Voor productie gebruik moet je een domein verifiëren:

1. Ga naar [Domains](https://resend.com/domains) in het Resend dashboard
2. Klik op "Add Domain"
3. Voer je domein in (bijv. `weareimpact.nl`)
4. Voeg de DNS records toe aan je domein provider:
   - SPF record
   - DKIM records
   - Return-Path record
5. Wacht tot de verificatie compleet is (kan enkele minuten tot uren duren)

### DNS Records Voorbeeld

Na het toevoegen van het domein krijg je DNS records die er ongeveer zo uitzien:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [lange string van Resend]

Type: CNAME
Name: resend
Value: feedback-smtp.resend.com
```

## Stap 3: API Key Genereren

1. Ga naar [API Keys](https://resend.com/api-keys)
2. Klik op "Create API Key"
3. Geef de key een naam (bijv. "WeAreImpact Production")
4. Selecteer "Full Access" of "Sending Access"
5. Kopieer de API key (deze wordt maar 1 keer getoond!)

## Stap 4: Environment Variables Instellen

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```bash
# Resend API Key (verkregen in stap 3)
RESEND_API_KEY=re_jouwApiKey123

# From email adres (moet van je geverifieerde domein zijn)
# Voor development: gebruik onboarding@resend.dev
# Voor productie: gebruik je eigen domein
RESEND_FROM_EMAIL=noreply@weareimpact.nl
```

### Development vs Production

**Development:**
```bash
RESEND_API_KEY=re_development_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Production:**
```bash
RESEND_API_KEY=re_production_key
RESEND_FROM_EMAIL=noreply@weareimpact.nl
```

## Stap 5: Testen

### Lokaal Testen

1. Start de development server: `npm run dev`
2. Maak een booking via de chat interface
3. Controleer:
   - Console logs voor email sending status
   - Je inbox voor de bevestigingsmail
   - Resend dashboard voor delivery status

### Email Test via API

Je kunt ook direct de email functionaliteit testen:

```typescript
import { sendEmail } from '@/lib/email/send';
import { generateBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation';

const template = generateBookingConfirmationEmail({
  customerName: 'Test User',
  bookingType: 'Kennismakingsgesprek',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 30 * 60000).toISOString(),
  duration: 30,
});

const result = await sendEmail({
  to: 'test@example.com',
  subject: template.subject,
  html: template.html,
  text: template.text,
});

console.log(result);
```

## Troubleshooting

### Email wordt niet verzonden

**Controleer:**
1. ✓ Is `RESEND_API_KEY` correct ingesteld?
2. ✓ Is `RESEND_FROM_EMAIL` van een geverifieerd domein?
3. ✓ Zijn de environment variables geladen? (restart dev server)
4. ✓ Check console logs voor error messages

**Veelvoorkomende errors:**

| Error | Oplossing |
|-------|-----------|
| `Missing API key` | Voeg `RESEND_API_KEY` toe aan `.env.local` |
| `Unverified domain` | Gebruik `onboarding@resend.dev` voor development |
| `Rate limit exceeded` | Wacht even, free tier heeft limieten |

### Email komt aan in spam

**Oplossingen:**
1. Zorg dat alle DNS records correct zijn ingesteld
2. Gebruik een geverifieerd domein (niet onboarding@resend.dev)
3. Voeg SPF, DKIM en DMARC records toe
4. Test met [mail-tester.com](https://www.mail-tester.com)

## Resend Free Tier Limieten

- **100 emails per dag**
- **1 domein**
- Onbeperkte API keys
- Email analytics

Voor meer emails: upgrade naar een betaald plan.

## Email Template Aanpassen

De booking confirmation template bevindt zich in:
```
src/lib/email/templates/booking-confirmation.ts
```

Je kunt het design aanpassen door de HTML te wijzigen in de `generateBookingConfirmationEmail` functie.

## Monitoring

Bekijk email delivery status in het [Resend Dashboard](https://resend.com/emails):
- Delivery status
- Open rates (indien tracking enabled)
- Bounce/complaint rates
- Email content preview

## Productie Checklist

Voor deployment naar productie:

- [ ] Domein geverifieerd in Resend
- [ ] DNS records correct ingesteld
- [ ] Production API key aangemaakt
- [ ] `RESEND_FROM_EMAIL` ingesteld op eigen domein
- [ ] Environment variables ingesteld in hosting platform
- [ ] Test email verzonden naar eigen adres
- [ ] Email komt niet in spam
- [ ] Email rendering getest in meerdere clients (Gmail, Outlook, etc.)

## Hulp Nodig?

- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
- [DNS Setup Guide](https://resend.com/docs/dashboard/domains/introduction)
