import { NextRequest } from 'next/server';
import { listInvoices } from '@/lib/finance/store';

export const dynamic = 'force-dynamic';

const dec = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');
const cell = (v: string | null | undefined) => `"${(v ?? '').replace(/"/g, '""')}"`;

// Verkoopfacturen als CSV (puntkomma, komma-decimalen, BOM) voor import of overtypen
// in de boekhouding. Alleen verstuurde facturen en creditnota's: die hebben een nummer.
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const year = Number(p.get('year')) || new Date().getFullYear();
  const quarter = Number(p.get('quarter')) || 0;
  const onlyOpenBooking = p.get('ongeboekt') === '1';

  const rows = (await listInvoices())
    .filter((i) => i.number && i.issuedOn && new Date(i.issuedOn).getFullYear() === year)
    .filter((i) => !quarter || Math.floor(new Date(i.issuedOn!).getMonth() / 3) + 1 === quarter)
    .filter((i) => !onlyOpenBooking || !i.boekhoudRef)
    .sort((a, b) => (a.number! < b.number! ? -1 : 1));

  const header = [
    'Factuurnummer', 'Factuurdatum', 'Vervaldatum', 'Klant', 'KvK', 'BTW-nummer', 'Omschrijving',
    'Bedrag excl. btw', 'Btw-percentage', 'Btw', 'Bedrag incl. btw', 'Status', 'Betaaldatum', 'Boekhoudreferentie',
  ];
  const lines = rows.map((i) =>
    [
      cell(i.number),
      cell(i.issuedOn),
      cell(i.dueOn),
      cell(i.client.legalName),
      cell(i.client.kvk),
      cell(i.client.btw),
      cell(i.termLabel ? `${i.title} - ${i.termLabel}` : i.title),
      dec(i.subtotalCents),
      String(i.vatRate),
      dec(i.vatCents),
      dec(i.totalCents),
      cell(i.status),
      cell(i.paidAt ? i.paidAt.slice(0, 10) : ''),
      cell(i.boekhoudRef),
    ].join(';'),
  );
  const csv = '﻿' + [header.map(cell).join(';'), ...lines].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="verkoopfacturen-${year}${quarter ? `-Q${quarter}` : ''}.csv"`,
    },
  });
}
