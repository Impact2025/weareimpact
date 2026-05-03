# Email Signature Instructies

## Stap 1: Logo voorbereiden (optioneel)

Als je het volledige logo wilt gebruiken (WeAreImpact tekst + tagline):

1. Sla je logo op als `WeAreImpact-logo-email.png` in de `public` folder
2. Aanbevolen afmetingen: 300-400px breed, transparante achtergrond
3. Het wordt dan beschikbaar via: `https://weareimpact.nl/WeAreImpact-logo-email.png`

## Stap 2: Email signature installeren

### Voor Gmail:
1. Open het bestand `email-signature.html` in je browser
2. Selecteer de hele signature (Ctrl+A of Cmd+A)
3. Kopieer (Ctrl+C of Cmd+C)
4. Ga naar Gmail → Instellingen → "Algemeen" → "Handtekening"
5. Plak de signature (Ctrl+V of Cmd+V)
6. Sla op

### Voor Outlook (Desktop):
1. Open Outlook
2. Ga naar Bestand → Opties → E-mail → Handtekeningen
3. Klik "Nieuw" en geef een naam (bijv. "WeAreImpact")
4. Open `email-signature.html` in je browser
5. Selecteer de signature en kopieer
6. Plak in het Outlook signature veld
7. Sla op

### Voor Outlook (Web):
1. Ga naar Outlook.com
2. Klik op het tandwiel-icoon → "Alle Outlook-instellingen weergeven"
3. Ga naar E-mail → Opstellen en beantwoorden → Emailhandtekening
4. Plak de signature zoals bij Gmail
5. Sla op

### Voor Apple Mail:
1. Open Mail → Voorkeuren → Handtekeningen
2. Klik op "+" om een nieuwe signature te maken
3. Open `email-signature.html` in Safari
4. Kopieer de signature en plak in Mail
5. Sluit het voorkeuren venster (wordt automatisch opgeslagen)

## Stap 3: Testen

Stuur een test email naar jezelf en controleer:
- ✅ Logo wordt correct weergegeven
- ✅ Links werken (telefoon, email, website, LinkedIn)
- ✅ Kleuren kloppen
- ✅ Werkt op mobiel

## Tips

### Versie zonder CTA button:
Als je de "Gratis AI Readiness Scan" button niet wilt, verwijder dat hele `<table>` block.

### Versie zonder emoji's:
Vervang de emoji's met HTML entities of verwijder ze:
- 📞 → "T:"
- ✉️ → "E:"
- 🌐 → "W:"
- 💼 → "L:"

### Alleen essentials (minimalistisch):
Gebruik alleen:
- Naam
- Functietitel
- Email
- Telefoon
- Website

## Veelvoorkomende problemen

### Logo wordt niet weergegeven
- Controleer of je website online is
- Controleer of het logo bestand bereikbaar is via `https://weareimpact.nl/WeAreImpact_hart.png`
- Sommige email clients blokkeren externe afbeeldingen standaard

### Opmaak ziet er anders uit
- Email clients hebben verschillende CSS ondersteuning
- De signature is geoptimaliseerd voor de meeste populaire clients
- Gebruik altijd inline styles (geen externe CSS)

### Te breed op mobiel
- De signature is responsive en past zich aan
- Maximale breedte is 600px

## Aanpassingen maken

### Kleuren aanpassen:
- Oranje: `#f97316`
- Donkergrijs: `#0f172a`
- Lichtgrijs: `#64748b`

### Font aanpassen:
De signature gebruikt Geist als primary font met fallbacks naar systeem fonts.

## Hosted logo versie

Als je een volledige logo afbeelding wilt gebruiken in plaats van het hart + HTML tekst:

```html
<img src="https://weareimpact.nl/WeAreImpact-logo-email.png"
     alt="WeAreImpact - Innovatie met een sociaal hart"
     width="300"
     style="display: block; border: 0; margin-bottom: 16px;">
```

Vervang het logo & brand section in de HTML met bovenstaande code.
