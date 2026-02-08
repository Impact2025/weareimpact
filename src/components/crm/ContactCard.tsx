'use client';

import Link from 'next/link';
import { User, Building2, Mail, Phone, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/lib/crm/types';
import { getContactFullName } from '@/lib/crm/labels';

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
  showCompany?: boolean;
}

export function ContactCard({ contact, onClick, showCompany = true }: ContactCardProps) {
  const fullName = getContactFullName(contact.firstName, contact.lastName);

  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">{fullName}</h3>
              {contact.isPrimary && (
                <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            {contact.jobTitle && (
              <p className="text-sm text-slate-500 truncate">{contact.jobTitle}</p>
            )}
            {showCompany && contact.companyName && (
              <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 size={12} />
                {contact.companyName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600"
            >
              <Mail size={14} />
              <span className="truncate">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600"
            >
              <Phone size={14} />
              <span>{contact.phone}</span>
            </a>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return (
    <Link href={`/admin/crm/contacten/${contact.id}`}>
      {content}
    </Link>
  );
}
