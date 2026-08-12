export interface IntakeQuestion {
  id: string;
  text: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface IntakeGroup {
  id: string;
  title: string;
  intro: string;
  questions: IntakeQuestion[];
}

export const INTAKE_GROUPS: IntakeGroup[] = [
  {
    id: "pijn",
    title: "Waar zit de pijn nu echt",
    intro: "Laten we beginnen bij het begin: niet wat je denkt dat je nodig hebt, maar waar het nu echt schuurt.",
    questions: [
      {
        id: "meeste_tijd",
        text: "Welke taak kost je nu de meeste tijd per week, en hoeveel uur ongeveer?",
        multiline: true,
      },
      {
        id: "laat_liggen",
        text: "Wat laat je nu liever liggen dan dat je zou willen, puur omdat er geen tijd voor is?",
        multiline: true,
      },
      {
        id: "een_ding_uitbesteden",
        text: "Als je één ding kon uitbesteden zonder erover na te hoeven denken, wat zou dat zijn?",
        multiline: true,
      },
      {
        id: "eerder_geprobeerd_ai",
        text: "Wat heb je de afgelopen maand geprobeerd zelf met AI te doen, en waar liep dat op vast?",
        multiline: true,
      },
    ],
  },
  {
    id: "scope",
    title: "Scope",
    intro: "Mooi, dat geeft me een goed beeld. Dan kijk ik nu welke onderdelen echt voor jou relevant zijn.",
    questions: [
      {
        id: "content_ritme",
        text: "Heb je nu al content (blogs, social) die je publiceert, en hoe vaak lukt dat in de praktijk versus wat je zou willen?",
        multiline: true,
      },
      {
        id: "acquisitie_outreach",
        text: "Doe je aan acquisitie/outreach, en zo ja: hoe, en hoeveel tijd kost dat nu?",
        multiline: true,
      },
      {
        id: "agenda_mail_beheer",
        text: "Wie beheert nu je agenda en mail — jijzelf, iemand anders, niemand structureel?",
      },
      {
        id: "merken_sites",
        text: "Werk je met één merk/organisatie of meerdere sites/labels?",
      },
    ],
  },
  {
    id: "controle",
    title: "Mate van controle",
    intro: "Dan wil ik weten hoeveel controle je wilt houden — dat bepaalt of Starter, Groei of Compleet bij je past.",
    questions: [
      {
        id: "goedkeuring_content",
        text: "Wil je zelf per stuk content goedkeuren, of vertrouw je erop dat het na een inwerkperiode vanzelf goed gaat?",
        multiline: true,
      },
      {
        id: "reactiesnelheid",
        text: "Hoe snel moet je een reactie hebben als er iets misgaat (koppeling stuk, mail niet verstuurd) — dezelfde dag, of is een paar dagen prima?",
      },
      {
        id: "update_frequentie",
        text: "Vind je een wekelijkse update genoeg, of wil je liever dagelijks zicht op wat er speelt?",
      },
    ],
  },
  {
    id: "techniek",
    title: "Techniek & toegang",
    intro: "Nu iets praktischers, dit bepaalt hoe je onboardingtraject eruitziet.",
    questions: [
      {
        id: "mail_agenda_platform",
        text: "Werk je met Microsoft 365 of Google Workspace voor mail en agenda?",
      },
      {
        id: "cms_platform",
        text: "Welk CMS of platform gebruik je voor publicatie (of heb je dat nog niet)?",
      },
      {
        id: "merkrichtlijnen",
        text: "Heb je bestaande merkrichtlijnen of tone-of-voice documentatie, of moet dat nog opgebouwd worden?",
      },
      {
        id: "voorbeeldcontent",
        text: "Heb je voorbeelden van eerder geschreven content die representatief zijn voor jouw stem? (Je kunt dit later mailen, een korte omschrijving is nu genoeg.)",
        multiline: true,
      },
    ],
  },
  {
    id: "verwachtingen",
    title: "Verwachtingen & randvoorwaarden",
    intro: "Laatste blok, dan weet ik precies waar ik rekening mee moet houden.",
    questions: [
      {
        id: "bewijs_drie_maanden",
        text: "Wat zou voor jou over drie maanden het bewijs zijn dat dit heeft gewerkt?",
        multiline: true,
      },
      {
        id: "budget_bandbreedte",
        text: "Heb je een budget-bandbreedte in gedachten, of wil je eerst zien wat er nodig is voordat we over prijs praten?",
      },
      {
        id: "nooit_door_ai",
        text: "Zijn er dingen die je nooit door AI wilt laten doen, ook niet met jouw goedkeuring achteraf?",
        multiline: true,
      },
      {
        id: "compliance_eisen",
        text: "Werk je in een sector met specifieke privacy-/compliance-eisen (AVG, keurmerk, subsidievoorwaarden) waar ik rekening mee moet houden?",
      },
    ],
  },
];

export const INTAKE_QUESTION_COUNT = INTAKE_GROUPS.reduce(
  (sum, group) => sum + group.questions.length,
  0
);
