/**
 * CRM Types & Interfaces
 */

export type UserRole = 'Admin' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type ClientStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Called'
  | 'Follow Up Required'
  | 'Proposal Sent'
  | 'Work In Progress'
  | 'Converted'
  | 'Failed'
  | 'Closed';

export type ClientPriority = 'High' | 'Medium' | 'Low';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'WhatsApp'
  | 'Cold Calling'
  | 'Other';

export interface Client {
  id: string; // CLI-XXXX
  name: string;
  companyName: string;
  email: string;
  phone: string;
  whatsApp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  
  industry: string;
  website: string;
  businessType: string;
  companySize: string;
  
  serviceRequired: string;
  currentProject: string;
  projectDescription: string;
  budget: number;
  expectedRevenue: number;
  startDate: string;
  deadline: string;
  
  status: ClientStatus;
  priority: ClientPriority;
  leadSource: LeadSource;
  assignedTo: string; // Employee Name
  createdAt: string;
}

export type CommType = 'Call' | 'Meeting' | 'Email' | 'WhatsApp';

export interface Communication {
  id: string;
  clientId: string;
  type: CommType;
  date: string;
  time: string;
  duration?: string; // Call duration like "15m" or "5m 23s"
  subject?: string; // For emails
  message?: string; // For emails/WhatsApp
  notes: string;
  status?: string; // e.g., "Completed", "Sent", "Delivered"
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Delivered';

export interface Project {
  id: string;
  clientId: string;
  projectName: string;
  description: string;
  deliverables: string;
  progress: number; // 0 - 100
  dueDate: string;
  status: ProjectStatus;
}

export interface ClientNote {
  id: string;
  clientId: string;
  title: string;
  description: string;
  dateAdded: string;
  createdBy: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | string;
  size: string;
  uploadDate: string;
  url: string; // Data URL or mock path
}

export interface Reminder {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  notes: string;
  completed: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  date: string;
  time: string;
  changesMade: string;
}

export interface CRMStats {
  totalClients: number;
  convertedClients: number;
  workInProgress: number;
  failedClients: number;
  followUpsPending: number;
  callsMadeToday: number;
  revenueGenerated: number;
  conversionRate: number; // calculated percentage
}
