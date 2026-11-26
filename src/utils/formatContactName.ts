import { Contact } from '../types/contact';

export function formatContactName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}
