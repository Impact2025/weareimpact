'use client';

/**
 * Ideeën voor de volgende versie van het project, ter bespreking met de klant. Bewust statisch: dit zijn
 * voorstellen, geen toezeggingen. Klantzichtbaar, dus gewone taal en geen jargon.
 */

type Tag = 'Hans' | 'Uitbreiding' | 'Suggestie';

interface Idea {
  title: string;
  text: string;
  tag: Tag;
}

interface Group {
  title: string;
  intro: string;
  ideas: Idea[];
}

const GROUPS: Group[] = [
  {
    title: 'Hans kan meer dan schrijven',
    intro:
      'Hans schrijft nu de mails en legt uit waarom een concept er staat. De grens blijft: Hans adviseert, jullie beslissen, en niets gaat zonder goedkeuring de deur uit.',
    ideas: [
      {
        tag: 'Hans',
        title: 'Wekelijkse terugblik',
        text: 'Elke week een korte samenvatting voor de eigenaar: wat leverden de mails op, en wat is slim om de volgende keer te doen.',
      },
      {
        tag: 'Hans',
        title: 'Antwoorden van gasten voorbereiden',
        text: 'Reageert een gast op een mail, dan stelt Hans een antwoord voor. De eigenaar leest het na en verstuurt het zelf.',
      },
      {
        tag: 'Hans',
        title: 'Slimmer kiezen wie eerst een mail krijgt',
        text: 'Hans bepaalt de volgorde van de gasten. Wie zich heeft afgemeld of recent al een mail kreeg, blijft altijd buiten beeld.',
      },
    ],
  },
  {
    title: 'Boost uitbreiden',
    intro: 'Dingen die we bewust na de eerste versie hebben gezet.',
    ideas: [
      {
        tag: 'Uitbreiding',
        title: 'Maandrapportage',
        text: 'Een maandelijks overzicht als pdf: extra gasten, geschatte extra omzet en wat het Boost-abonnement oplevert.',
      },
      {
        tag: 'Uitbreiding',
        title: 'Eigen bericht voor de wachtlijst',
        text: 'Nu stuurt BokaBord zelf de sms. Met een eigen bericht klinkt het als het restaurant zelf.',
      },
      {
        tag: 'Uitbreiding',
        title: 'Extraatje aanbieden vóór de reservering',
        text: 'Tijdens het reserveren een aanbod doen, bijvoorbeeld een menu of een arrangement. Dit hangt af van de boekflow van BokaBord.',
      },
      {
        tag: 'Uitbreiding',
        title: 'Toestemming vastleggen, daarna sms en WhatsApp',
        text: 'Bij nieuwe boekingen vragen we toestemming. Daarmee kunnen we later ook andere kanalen gebruiken.',
      },
      {
        tag: 'Uitbreiding',
        title: 'Versturen via BokaBord',
        text: 'Mails versturen via BokaBord zelf, zodra daar een manier voor is om veel mails tegelijk te sturen.',
      },
    ],
  },
  {
    title: 'Suggesties van ons',
    intro: 'Ideeën die we zelf zien, om te bespreken of ze bij jullie passen.',
    ideas: [
      {
        tag: 'Suggestie',
        title: 'Bedankmail na een bezoek',
        text: 'Een korte, persoonlijke bedankmail een dag na het bezoek, met een uitnodiging om weer te komen.',
      },
      {
        tag: 'Suggestie',
        title: 'Rustige dagen vooruit zien',
        text: 'Nu reageren we op rustige tijdsloten in de komende dagen. Een verwachting voor de komende weken laat je eerder bijsturen.',
      },
      {
        tag: 'Suggestie',
        title: 'Vestigingen naast elkaar',
        text: 'Eén overzicht waarin je de restaurants met elkaar vergelijkt: wat werkt waar, en waar zit nog ruimte.',
      },
    ],
  },
];

const TAG_COLORS: Record<Tag, { bg: string; fg: string }> = {
  Hans: { bg: '#e0f2fe', fg: '#075985' },
  Uitbreiding: { bg: '#fff1e6', fg: '#9a3412' },
  Suggestie: { bg: '#ecfdf5', fg: '#065f46' },
};

export default function V2Client() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#444' }}>
        Ideeën voor de volgende versie. Dit zijn voorstellen om over te praten, nog geen toezeggingen. Laat Vincent weten
        welke het meest bij jullie passen.
      </p>

      {GROUPS.map((group) => (
        <section key={group.title}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>{group.title}</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.5, color: '#666' }}>{group.intro}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {group.ideas.map((idea) => (
              <div
                key={idea.title}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{idea.title}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: TAG_COLORS[idea.tag].bg,
                      color: TAG_COLORS[idea.tag].fg,
                    }}
                  >
                    {idea.tag}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: '#444' }}>{idea.text}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
