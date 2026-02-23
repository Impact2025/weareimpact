import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      category: 'Visie & Strategie',
      questions: [
        {
          question: 'Wat doet een Strategic Innovation Partner precies?',
          answer:
            'Fundamenteel anders dan een interim-manager die de boel runt zoals het was. Als Strategic Innovation Partner is Vincent een veranderaar. Zijn belofte is concreet: hij maakt jouw organisatie in 90 dagen AI-ready. Niet alleen de techniek, maar ook de mensen eromheen — zodat het beklijft als hij vertrekt.',
        },
        {
          question: 'Hoe kijk je aan tegen de ethiek van AI en privacy?',
          answer:
            '"Ik verkoop geen data, ik verkoop impact." In een tijd waarin Big Tech data ziet als handelswaar, bouwt Vincent ecosystemen waarin privacy en empathie leidend zijn. Technologie als middel voor echt contact — niet als middel om mensen aan een scherm te binden.',
        },
      ],
    },
    {
      category: 'Impact & Software',
      questions: [
        {
          question: 'Hoe maakt software als DAAR maatschappelijke impact meetbaar?',
          answer:
            'Traditionele systemen richten zich op administratie. DAAR is gebouwd om vrijwilligerswerk te waarderen. De software maakt zogeheten Geluksmomenten meetbaar voor gemeenten en stichtingen. Daarmee verschuift de focus van kille cijfers naar daadwerkelijke maatschappelijke waarde.',
        },
        {
          question: 'Waarin verschilt Bewaardvoorjou van standaard zorgsystemen?',
          answer:
            'Veel systemen zijn functionele databases. Bewaardvoorjou is een empathische AI-tool gericht op de levensverhalen van ouderen. Het doel is niet opslag, maar verbinding: generaties aan elkaar knopen en eenzaamheid actief tegengaan.',
        },
      ],
    },
    {
      category: 'Samenwerking',
      questions: [
        {
          question: 'Wat houdt het 90-dagentraject in?',
          answer:
            'Een intensief traject voor organisaties die willen vernieuwen zonder jarenlange consultancytrajecten. In één kwartaal analyseren, implementeren en overdragen we — zodat jouw team er zelfstandig mee verder kan. Vanwege de intensiteit zijn er per kwartaal slechts beperkte plekken beschikbaar.',
        },
      ],
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">
          Vragen die er toe doen
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Over visie, aanpak en hoe samenwerking met WeAreImpact eruitziet.
        </p>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                <span className="inline-block w-1.5 h-6 bg-orange-500 mr-3 rounded-full"></span>
                {category.category}
              </h3>

              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((faq, questionIndex) => (
                  <AccordionItem
                    key={questionIndex}
                    value={`${categoryIndex}-${questionIndex}`}
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
          ))}
        </div>
      </div>
    </section>
  );
}
