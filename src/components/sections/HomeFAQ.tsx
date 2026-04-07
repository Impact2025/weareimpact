import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function HomeFAQ() {
  const faqs = [
    {
      question: 'Mijn organisatie wil innoveren. Is AI dan altijd het antwoord?',
      answer:
        'Nee, zeker niet. Innovatie gaat over mensen, niet over systemen. Ik kijk eerst naar jouw vraagstuk. Soms is een slimme AI-toepassing de versneller die je zoekt. Soms ligt de oplossing in een andere manier van samenwerken of een LEGO® Serious Play sessie die in één dag blootlegt wat maanden vergaderen niet lukt. Ik gebruik technologie als het moet, en menselijk contact waar het kan.',
    },
    {
      question: 'Wat is het verschil tussen jou en een gewone consultant?',
      answer:
        'Een consultant schrijft een rapport. Ik breng beweging. Ik kom als veranderaar, niet als adviseur op afstand. Of we nu AI implementeren of een cultuurverandering doorvoeren: je ziet binnen 90 dagen resultaat. En als ik vertrek, staat jouw team er zelfstandig voor.',
    },
    {
      question: 'Wat houdt het 90-dagentraject precies in?',
      answer:
        'We starten met een scherpe analyse van waar jouw organisatie staat en wat écht nodig is. Daarna implementeer ik samen met jouw team wat werkt. Geen eindeloze planningsfase, geen dikke rapporten. Aan het einde van de 90 dagen heb je resultaat én eigenaarschap.',
    },
    {
      question: 'Ben je beschikbaar voor een interim-opdracht?',
      answer:
        'Ik neem bewust een beperkt aantal trajecten aan, zodat ik elke klant de aandacht kan geven die het verdient. Voor Q2 2026 zijn er nog 2 plekken beschikbaar voor organisaties die durven te vernieuwen met een sociaal hart.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">
          Veelgestelde vragen
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          De vragen die ik het vaakst krijg van organisaties die willen vernieuwen.
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
