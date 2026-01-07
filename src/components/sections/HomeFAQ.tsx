import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function HomeFAQ() {
  const faqs = [
    {
      question: 'Mijn organisatie moet vernieuwen. Is AI dan altijd de oplossing?',
      answer:
        'Nee, zeker niet. Innovatie gaat over mensen, niet over systemen. Als Sociaal Architect kijk ik eerst naar uw vraagstuk. Soms is een slimme AI-toepassing de versneller die u zoekt, maar soms ligt de oplossing in cultuurverandering of een creatieve sessie (zoals LEGO® Serious Play). Ik gebruik technologie als het moet, maar menselijk contact waar het kan.',
    },
    {
      question: "Waarin verschilt jouw rol als 'Strategic Innovation Partner' van een consultant?",
      answer:
        'Een consultant schrijft een rapport; ik breng beweging. Ik word ingehuurd als veranderaar. Of we nu innoveren met geavanceerde AI of via sociale interventies: ik zorg dat u binnen 3 maanden resultaat ziet. Ik help patronen te doorbreken en maak uw organisatie klaar voor de toekomst, met of zonder stekker.',
    },
    {
      question: "Wat houdt de '3-maanden transformatie' in?",
      answer:
        'Ik hanteer een bewezen methodiek om organisaties in precies één kwartaal in een nieuwe versnelling te krijgen. We bepalen samen de koers: wordt het \'The Growth Engine\' (tech & AI) of \'The Playground\' (creatieve innovatie)? Mijn doel is altijd: impact maken en uw team eigenaarschap geven.',
    },
    {
      question: 'Ben je beschikbaar voor een interim-opdracht?',
      answer:
        'Omdat ik geloof in kwaliteit boven kwantiteit, neem ik slechts een beperkt aantal partnerschappen aan. Voor Q1 2026 heb ik momenteel nog 2 plekken beschikbaar voor organisaties die durven te vernieuwen met een sociaal hart.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">
          Veelgestelde vragen over mijn aanpak
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Ontdek hoe ik organisaties help vernieuwen met een sociaal hart
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-white border border-slate-200 rounded-lg px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5 text-slate-900 font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
