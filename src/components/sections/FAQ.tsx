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
          question: "Wat betekent de rol van 'Strategic Innovation Partner' precies?",
          answer:
            "Dit is fundamenteel anders dan een interim-manager die 'op de winkel past'. Als Strategic Innovation Partner is Vincent van Munster een veranderaar. Zijn belofte is concreet: hij maakt uw organisatie in precies 3 maanden AI-ready. Dit omvat niet alleen de techniek, maar vooral de implementatie van strategisch sociaal beleid en het ontwerpen van ecosystemen voor menselijk geluk.",
        },
        {
          question: 'Hoe kijkt u aan tegen de ethiek van AI en privacy?',
          answer:
            'De kernvisie is: "Ik verkoop geen data, ik verkoop impact." In een tijd waarin Big Tech data vaak ziet als handelswaar, ontwikkelt Vincent ecosystemen waarin privacy en empathie leidend zijn. Technologie wordt hier ingezet als een \'enabler\' voor echt contact en om mensen te helpen offline te leven, in plaats van ze aan een scherm te binden.',
        },
      ],
    },
    {
      category: 'Impact & Software',
      questions: [
        {
          question: 'Hoe maakt software als DAAR maatschappelijke impact meetbaar?',
          answer:
            "Traditionele systemen richten zich op administratie. DAAR is ontwikkeld om vrijwilligerswerk te waarderen. De software introduceert een unieke metric voor gemeenten en stichtingen: het meetbaar maken van 'Geluksmomenten'. Hiermee verschuift de focus van kille cijfers naar daadwerkelijke maatschappelijke waarde.",
        },
        {
          question: "Waarin verschilt 'Bewaardvoorjou' van standaard zorgsystemen?",
          answer:
            "Veel systemen zijn functionele databases. Bewaardvoorjou is een empathische AI-tool gericht op de 'Life Journey' van ouderen. Het doel is niet opslag, maar verbinding: het vastleggen van levensverhalen om generaties te verbinden en eenzaamheid actief tegen te gaan.",
        },
      ],
    },
    {
      category: 'Samenwerking',
      questions: [
        {
          question: "Wat houdt de '3-maanden transformatie' in?",
          answer:
            "Dit is een intensief traject voor organisaties die willen innoveren zonder jarenlange consultancy-trajecten. In één kwartaal (Q1, Q2, etc.) wordt de 'Funding Engine' (strategie) gekoppeld aan de 'Growth Engine' (tech). Let op: Vanwege de intensiteit zijn er per kwartaal slechts beperkte plekken beschikbaar (Status Q1 2026: nog 2 plekken).",
        },
      ],
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-slate-900">
          Veelgestelde vragen over Sociale Innovatie & AI
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Ontdek hoe we innovatie, technologie en menselijkheid samenbrengen
        </p>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                <span className="inline-block w-1.5 h-6 bg-orange-500 mr-3 rounded-full"></span>
                Categorie {categoryIndex + 1}: {category.category}
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
