import { relations } from 'drizzle-orm';
import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Employee'), // 'Admin' | 'Employee'
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Clients Table
export const clients = pgTable('clients', {
  id: text('id').primaryKey(), // CLI-XXXX
  name: text('name').notNull(),
  companyName: text('company_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  whatsApp: text('whatsapp'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  industry: text('industry'),
  website: text('website'),
  businessType: text('business_type'),
  companySize: text('company_size'),
  serviceRequired: text('service_required'),
  currentProject: text('current_project'),
  projectDescription: text('project_description'),
  budget: integer('budget').default(0).notNull(),
  expectedRevenue: integer('expected_revenue').default(0).notNull(),
  startDate: text('start_date'),
  deadline: text('deadline'),
  status: text('status').notNull(), // ClientStatus type
  priority: text('priority').notNull(), // ClientPriority type
  leadSource: text('lead_source').notNull(), // LeadSource type
  assignedTo: text('assigned_to'), // Employee Name
  createdAt: text('created_at').notNull(),
});

// 3. Communications Table
export const communications = pgTable('communications', {
  id: text('id').primaryKey(), // COM-XXXX
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'Call' | 'Meeting' | 'Email' | 'WhatsApp'
  date: text('date').notNull(),
  time: text('time').notNull(),
  duration: text('duration'),
  subject: text('subject'),
  message: text('message'),
  notes: text('notes').notNull(),
  status: text('status'),
});

// 4. Projects Table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(), // PRJ-XXXX
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  projectName: text('project_name').notNull(),
  description: text('description'),
  deliverables: text('deliverables'),
  progress: integer('progress').default(0).notNull(), // 0 - 100
  dueDate: text('due_date'),
  status: text('status').notNull(), // ProjectStatus
});

// 5. Notes Table
export const notes = pgTable('notes', {
  id: text('id').primaryKey(), // NTE-XXXX
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dateAdded: text('date_added').notNull(),
  createdBy: text('created_by').notNull(),
});

// 6. Reminders Table
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(), // REM-XXXX
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  clientName: text('client_name').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  notes: text('notes').notNull(),
  completed: boolean('completed').default(false).notNull(),
});

// 7. Documents Table
export const documents = pgTable('documents', {
  id: text('id').primaryKey(), // DOC-XXXX
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: text('size').notNull(),
  uploadDate: text('upload_date').notNull(),
  url: text('url').notNull(),
});

// 8. Activities Table
export const activities = pgTable('activities', {
  id: text('id').primaryKey(), // ACT-XXXX
  user: text('user').notNull(),
  action: text('action').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  changesMade: text('changes_made').notNull(),
});

// Relations definitions
export const clientsRelations = relations(clients, ({ many }) => ({
  communications: many(communications),
  projects: many(projects),
  notes: many(notes),
  reminders: many(reminders),
  documents: many(documents),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  client: one(clients, {
    fields: [communications.clientId],
    references: [clients.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  client: one(clients, {
    fields: [notes.clientId],
    references: [clients.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  client: one(clients, {
    fields: [reminders.clientId],
    references: [clients.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
}));
