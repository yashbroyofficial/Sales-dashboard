import { db } from './index.ts';
import { clients, communications, projects, notes, reminders, documents, activities, users } from './schema.ts';
import { eq, or, and, like, desc, asc, count, sum } from 'drizzle-orm';
import { Client, Communication, Project, ClientNote, ClientDocument, Reminder, ActivityLog } from '../types.js';

// Helper to log actions dynamically
export async function dbLogAction(user: string, action: string, changesMade: string) {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const newLog = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: user || 'System',
      action,
      date: dateStr,
      time: timeStr,
      changesMade,
    };

    await db.insert(activities).values(newLog);
    return newLog;
  } catch (err) {
    console.error('Failed to write log in dbLogAction:', err);
  }
}

// ---------------- CLIENTS QUERIES ----------------

export async function getClients(filters: {
  status?: string;
  priority?: string;
  leadSource?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
}) {
  try {
    let conditions = [];

    if (filters.status) {
      conditions.push(eq(clients.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(clients.priority, filters.priority));
    }
    if (filters.leadSource) {
      conditions.push(eq(clients.leadSource, filters.leadSource));
    }
    if (filters.assignedTo) {
      conditions.push(eq(clients.assignedTo, filters.assignedTo));
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(clients.name, searchPattern),
          like(clients.companyName, searchPattern),
          like(clients.email, searchPattern),
          like(clients.phone, searchPattern)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    let query = db.select().from(clients);

    if (whereClause) {
      query = query.where(whereClause) as any;
    }

    // Sort order definition
    let results;
    if (filters.sortBy === 'newest') {
      results = await query.orderBy(desc(clients.createdAt));
    } else if (filters.sortBy === 'oldest') {
      results = await query.orderBy(asc(clients.createdAt));
    } else if (filters.sortBy === 'revenue') {
      results = await query.orderBy(desc(clients.expectedRevenue));
    } else if (filters.sortBy === 'name') {
      results = await query.orderBy(asc(clients.name));
    } else {
      // Default: sort by ID desc
      results = await query.orderBy(desc(clients.id));
    }

    return results as Client[];
  } catch (error) {
    console.error('Database query failed in getClients:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getClientById(id: string) {
  try {
    const clientRows = await db.select().from(clients).where(eq(clients.id, id));
    if (clientRows.length === 0) {
      return null;
    }

    const client = clientRows[0];
    const commTimeline = await db.select().from(communications).where(eq(communications.clientId, id)).orderBy(desc(communications.date));
    const projectTimeline = await db.select().from(projects).where(eq(projects.clientId, id));
    const noteTimeline = await db.select().from(notes).where(eq(notes.clientId, id)).orderBy(desc(notes.dateAdded));
    const documentTimeline = await db.select().from(documents).where(eq(documents.clientId, id)).orderBy(desc(documents.uploadDate));
    const reminderTimeline = await db.select().from(reminders).where(eq(reminders.clientId, id)).orderBy(asc(reminders.date));

    return {
      ...client,
      communications: commTimeline as Communication[],
      projects: projectTimeline as Project[],
      notes: noteTimeline as ClientNote[],
      documents: documentTimeline as ClientDocument[],
      reminders: reminderTimeline as Reminder[]
    };
  } catch (error) {
    console.error(`Database query failed in getClientById key: ${id}`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function createClient(clientData: Partial<Client>, currentUser: string) {
  try {
    // Determine high-availability auto sequence ID
    const currentClients = await db.select({ id: clients.id }).from(clients);
    const currentIds = currentClients.map(c => {
      const num = parseInt(c.id.replace('CLI-', ''));
      return isNaN(num) ? 1000 : num;
    });
    const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 1000;
    const newId = `CLI-${maxId + 1}`;

    const newClientRow = {
      ...clientData,
      id: newId,
      budget: Number(clientData.budget) || 0,
      expectedRevenue: Number(clientData.expectedRevenue) || 0,
      createdAt: new Date().toISOString(),
      status: clientData.status || 'New Lead',
      priority: clientData.priority || 'Medium',
      leadSource: clientData.leadSource || 'Website',
      name: clientData.name || '',
      companyName: clientData.companyName || '',
      email: clientData.email || '',
    };

    const inserted = await db.insert(clients).values(newClientRow as any).returning();

    await dbLogAction(currentUser, 'Added Business Client', `Successfully registered client "${newClientRow.name} (${newClientRow.companyName})" in database.`);

    return inserted[0] as Client;
  } catch (error) {
    console.error('Database query failed in createClient:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateClient(id: string, clientData: Partial<Client>, currentUser: string) {
  try {
    const existingRows = await db.select().from(clients).where(eq(clients.id, id));
    if (existingRows.length === 0) {
      return null;
    }

    const oldClient = existingRows[0];
    let differencesLog = '';
    if (clientData.status && oldClient.status !== clientData.status) {
      differencesLog += `Status changed from "${oldClient.status}" to "${clientData.status}". `;
    }
    if (clientData.priority && oldClient.priority !== clientData.priority) {
      differencesLog += `Priority modified to "${clientData.priority}". `;
    }
    if (clientData.expectedRevenue !== undefined && oldClient.expectedRevenue !== clientData.expectedRevenue) {
      differencesLog += `Expected Revenue changed from $${oldClient.expectedRevenue.toLocaleString()} to $${Number(clientData.expectedRevenue).toLocaleString()}. `;
    }

    if (!differencesLog) {
      differencesLog = 'Updated client profile attributes.';
    }

    const updatePayload = {
      ...clientData,
      budget: clientData.budget !== undefined ? Number(clientData.budget) : undefined,
      expectedRevenue: clientData.expectedRevenue !== undefined ? Number(clientData.expectedRevenue) : undefined,
    };

    const updated = await db.update(clients)
      .set(updatePayload as any)
      .where(eq(clients.id, id))
      .returning();

    await dbLogAction(currentUser, 'Updated Client Profile', `Client "${oldClient.name}": ${differencesLog}`);

    return updated[0] as Client;
  } catch (error) {
    console.error(`Database query failed in updateClient key: ${id}`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteClient(id: string, currentUser: string) {
  try {
    const existingRows = await db.select().from(clients).where(eq(clients.id, id));
    if (existingRows.length === 0) {
      return false;
    }

    const client = existingRows[0];

    // Delete cascading references (Handled at database schema level cascading, but we can verify)
    await db.delete(clients).where(eq(clients.id, id));

    await dbLogAction(currentUser, 'Deleted Business Client', `Permanently purged client records for "${client.name} (${client.companyName})".`);

    return true;
  } catch (error) {
    console.error(`Database query failed in deleteClient key: ${id}`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- TIMELINES CRUD ACTIONS ----------------

export async function addCommunication(clientId: string, commData: Partial<Communication>, currentUser: string) {
  try {
    const newComm = {
      ...commData,
      id: `COM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId,
      type: commData.type || 'Call',
      date: commData.date || new Date().toISOString().split('T')[0],
      time: commData.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: commData.notes || '',
    };

    const result = await db.insert(communications).values(newComm).returning();

    await dbLogAction(currentUser, `Added ${newComm.type} Log`, `Logged ${newComm.type} conversation on client pipeline timeline: ${newComm.notes.substring(0, 50)}...`);

    return result[0] as Communication;
  } catch (error) {
    console.error('Database query failed in addCommunication:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addReminder(clientId: string, clientName: string, reminderData: Partial<Reminder>, currentUser: string) {
  try {
    const newReminder = {
      ...reminderData,
      id: `REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId,
      clientName,
      date: reminderData.date || new Date().toISOString().split('T')[0],
      time: reminderData.time || '10:00',
      notes: reminderData.notes || '',
      completed: false,
    };

    const result = await db.insert(reminders).values(newReminder).returning();

    await dbLogAction(currentUser, 'Scheduled Follow-Up Reminder', `Assigned CRM follow-up event with ${clientName} on ${newReminder.date} at ${newReminder.time}.`);

    return result[0] as Reminder;
  } catch (error) {
    console.error('Database query failed in addReminder:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateReminder(reminderId: string, completed: boolean, currentUser: string) {
  try {
    const existing = await db.select().from(reminders).where(eq(reminders.id, reminderId));
    if (existing.length === 0) {
      return null;
    }

    const updated = await db.update(reminders)
      .set({ completed })
      .where(eq(reminders.id, reminderId))
      .returning();

    const statusName = completed ? 'Marked Completed' : 'Reopened Schedule';
    await dbLogAction(currentUser, 'Updated Reminder Schedule', `${statusName} follow-up task detailing: "${existing[0].notes}"`);

    return updated[0] as Reminder;
  } catch (error) {
    console.error(`Database query failed in updateReminder key: ${reminderId}`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addProject(clientId: string, projectData: Partial<Project>, currentUser: string) {
  try {
    const newProj = {
      ...projectData,
      id: `PRJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId,
      projectName: projectData.projectName || 'New Project',
      progress: Number(projectData.progress) || 0,
      status: projectData.status || 'In Progress',
    };

    const result = await db.insert(projects).values(newProj as any).returning();

    await dbLogAction(currentUser, 'Added Active Project', `Kicked off client project "${newProj.projectName}" with delivery stage "${newProj.status}".`);

    return result[0] as Project;
  } catch (error) {
    console.error('Database query failed in addProject:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateProject(projId: string, projectData: Partial<Project>, currentUser: string) {
  try {
    const existing = await db.select().from(projects).where(eq(projects.id, projId));
    if (existing.length === 0) {
      return null;
    }

    const updated = await db.update(projects)
      .set({
        ...projectData,
        progress: projectData.progress !== undefined ? Number(projectData.progress) : undefined,
      } as any)
      .where(eq(projects.id, projId))
      .returning();

    await dbLogAction(currentUser, 'Modified Project Attributes', `Project "${existing[0].projectName}": Progress updated to ${projectData.progress}% (${projectData.status}).`);

    return updated[0] as Project;
  } catch (error) {
    console.error(`Database query failed in updateProject key: ${projId}`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addNote(clientId: string, noteData: Partial<ClientNote>, currentUser: string) {
  try {
    const newNote = {
      ...noteData,
      id: `NTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId,
      title: noteData.title || 'Note',
      description: noteData.description || '',
      dateAdded: new Date().toISOString(),
      createdBy: currentUser,
    };

    const result = await db.insert(notes).values(newNote).returning();

    const clientRows = await db.select({ name: clients.name }).from(clients).where(eq(clients.id, clientId));
    const clientName = clientRows.length > 0 ? clientRows[0].name : 'Client';

    await dbLogAction(currentUser, 'Added Saved note', `Wrote account note file on ${clientName}'s workspace: "${newNote.title}".`);

    return result[0] as ClientNote;
  } catch (error) {
    console.error('Database query failed in addNote:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addDocument(clientId: string, docData: Partial<ClientDocument>, currentUser: string) {
  try {
    const newDoc = {
      ...docData,
      id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId,
      name: docData.name || 'Document',
      type: docData.type || 'PDF',
      size: docData.size || '0 KB',
      uploadDate: new Date().toISOString().split('T')[0],
      url: docData.url || '#',
    };

    const result = await db.insert(documents).values(newDoc).returning();

    await dbLogAction(currentUser, 'Uploaded Account Document', `Stored client file attachment on record: "${newDoc.name}" (${newDoc.size}).`);

    return result[0] as ClientDocument;
  } catch (error) {
    console.error('Database query failed in addDocument:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getActivities() {
  try {
    const list = await db.select().from(activities).orderBy(desc(activities.id)).limit(60);
    return list as ActivityLog[];
  } catch (error) {
    console.error('Database query failed in getActivities:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- DASHBOARD KPI STATS ----------------

export async function getDashboardStats() {
  try {
    const clientsList = await db.select().from(clients);
    const projectsList = await db.select().from(projects);
    const remindersList = await db.select().from(reminders);
    const communicationsList = await db.select().from(communications);

    const totalClients = clientsList.length;
    const convertedClients = clientsList.filter(c => c.status === 'Converted').length;
    const failedClients = clientsList.filter(c => c.status === 'Failed').length;
    const workInProgress = clientsList.filter(c => c.status === 'Work In Progress').length;
    const followUpsPending = remindersList.filter(r => !r.completed).length;

    // Calls made today index
    const todayStr = new Date().toISOString().split('T')[0];
    const callsMadeToday = communicationsList.filter(c => c.type === 'Call' && c.date === todayStr).length;

    // Total Revenue Generated (Budget from converted states)
    const revenueGenerated = clientsList
      .filter(c => c.status === 'Converted')
      .reduce((sum, c) => sum + (c.budget || 0), 0);

    // Conversion rate (convert / total non-active or convert / total leads)
    const totalConcludedLeads = clientsList.filter(c => ['Converted', 'Failed', 'Closed'].includes(c.status)).length;
    const conversionRate = totalConcludedLeads > 0 
      ? Math.round((convertedClients / totalConcludedLeads) * 100) 
      : (totalClients > 0 ? Math.round((convertedClients / totalClients) * 100) : 0);

    return {
      totalClients,
      convertedClients,
      workInProgress,
      failedClients,
      followUpsPending,
      callsMadeToday,
      revenueGenerated,
      conversionRate
    };
  } catch (error) {
    console.error('Database query failed in getDashboardStats:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- CHARTS METRICS ----------------

export async function getChartsData() {
  try {
    const clientsList = await db.select().from(clients);

    // 1. Lead Status distribution
    const statusCounts: { [status: string]: number } = {
      'New Lead': 0,
      'Contacted': 0,
      'Called': 0,
      'Follow Up Required': 0,
      'Proposal Sent': 0,
      'Work In Progress': 0,
      'Converted': 0,
      'Failed': 0,
      'Closed': 0
    };
    clientsList.forEach(c => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });
    const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // 2. Monthly client acquisition (grouped by month of createdAt)
    const monthlyCounts: { [month: string]: number } = {};
    clientsList.forEach(c => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
    });
    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAcquisitionData = monthsOrder
      .filter(month => monthlyCounts[month] !== undefined || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes(month))
      .map(month => ({
        month,
        clients: monthlyCounts[month] || 0
      }));

    // 3. Conversion Funnel
    const funnelSteps = [
      { name: 'New Lead', count: clientsList.length },
      { name: 'Contacted', count: clientsList.filter(c => !['New Lead'].includes(c.status)).length },
      { name: 'Proposal Sent', count: clientsList.filter(c => ['Proposal Sent', 'Work In Progress', 'Converted', 'Failed', 'Closed'].includes(c.status)).length },
      { name: 'Work In Progress', count: clientsList.filter(c => ['Work In Progress', 'Converted'].includes(c.status)).length },
      { name: 'Converted', count: clientsList.filter(c => c.status === 'Converted').length }
    ];

    // 4. Monthly Revenue Generated Chart
    const monthlyRevenue: { [month: string]: number } = {};
    clientsList.filter(c => c.status === 'Converted').forEach(c => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyRevenue[monthName] = (monthlyRevenue[monthName] || 0) + (c.budget || 0);
    });
    const revenueChartData = monthsOrder
      .filter(month => monthlyRevenue[month] !== undefined || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].includes(month))
      .map(month => ({
        month,
        revenue: monthlyRevenue[month] || 0
      }));

    // 5. Employee Performance metrics
    const employees = ['John Doe', 'Jane Smith', 'Sarah Jenkins'];
    const employeePerformance = employees.map(emp => {
      const assignedClients = clientsList.filter(c => c.assignedTo === emp);
      const conversions = assignedClients.filter(c => c.status === 'Converted').length;
      const revenue = assignedClients.filter(c => c.status === 'Converted').reduce((sum, c) => sum + (c.budget || 0), 0);
      return {
        employee: emp,
        leadsHandled: assignedClients.length,
        conversions,
        revenue
      };
    });

    // 6. Lead Source conversions
    const leadSources = ['Website', 'Referral', 'Instagram', 'Facebook', 'LinkedIn', 'WhatsApp', 'Cold Calling', 'Other'];
    const leadSourceData = leadSources.map(src => {
      const srcClients = clientsList.filter(c => c.leadSource === src);
      const conversions = srcClients.filter(c => c.status === 'Converted').length;
      return {
        source: src,
        leads: srcClients.length,
        conversions
      };
    });

    return {
      statusChartData,
      monthlyAcquisitionData,
      funnelData: funnelSteps,
      revenueChartData,
      employeePerformance,
      leadSourceData
    };
  } catch (error) {
    console.error('Database query failed in getChartsData:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- CALENDAR EVENTS QUERIES ----------------

export async function getCalendarEvents() {
  try {
    const projectsList = await db.select().from(projects);
    const remindersList = await db.select().from(reminders);
    const communicationsList = await db.select().from(communications);
    const clientsList = await db.select().from(clients);

    const events: any[] = [];

    // Add Project Deadlines
    projectsList.forEach(p => {
      if (!p.dueDate) return;
      const client = clientsList.find(c => c.id === p.clientId);
      events.push({
        id: `ev-prj-${p.id}`,
        type: 'Deadline',
        title: `Project Deadline: ${p.projectName}`,
        date: p.dueDate,
        time: '18:00',
        description: `Delivery deadline of client ${client?.companyName || 'Unknown'}. Deliverables: ${p.deliverables}`,
        clientName: client?.name || 'Unknown',
        companyName: client?.companyName || 'Unknown',
        badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-700'
      });
    });

    // Add Follow Up Reminders
    remindersList.forEach(r => {
      if (!r.date) return;
      events.push({
        id: `ev-rem-${r.id}`,
        type: 'Follow Up',
        title: `Follow Up: ${r.clientName}`,
        date: r.date,
        time: r.time || '10:00',
        description: r.notes,
        clientName: r.clientName,
        completed: r.completed,
        badgeColor: r.completed 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 line-through' 
          : 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
      });
    });

    // Add Scheduled Meetings from Communication Timeline entries
    communicationsList.filter(c => c.type === 'Meeting').forEach(m => {
      if (!m.date) return;
      const client = clientsList.find(c => c.id === m.clientId);
      events.push({
        id: `ev-meet-${m.id}`,
        type: 'Meeting',
        title: `Meeting: ${client?.companyName || 'Client'}`,
        date: m.date,
        time: m.time || '14:00',
        description: m.notes,
        clientName: client?.name || 'Unknown',
        companyName: client?.companyName || 'Unknown',
        badgeColor: 'bg-amber-50 border-amber-200 text-amber-700'
      });
    });

    return events;
  } catch (error) {
    console.error('Database query failed in getCalendarEvents:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// ---------------- BATCH IMPORT SERVICE ----------------

export async function batchImportClients(importList: any[], currentUser: string) {
  try {
    const currentClients = await db.select({ id: clients.id }).from(clients);
    const currentIds = currentClients.map(c => {
      const num = parseInt(c.id.replace('CLI-', ''));
      return isNaN(num) ? 1000 : num;
    });
    let maxId = currentIds.length > 0 ? Math.max(...currentIds) : 1000;

    const validClients: any[] = [];
    const errors: string[] = [];

    importList.forEach((item, index) => {
      if (!item.name || !item.companyName || !item.email) {
        errors.push(`Row ${index + 1} contains blank required entries (Name, Company, Email required).`);
        return;
      }

      maxId++;
      validClients.push({
        id: `CLI-${maxId}`,
        name: String(item.name).trim(),
        companyName: String(item.companyName).trim(),
        email: String(item.email).trim(),
        phone: String(item.phone || '').trim(),
        whatsApp: String(item.whatsApp || '').trim(),
        address: String(item.address || '').trim(),
        city: String(item.city || '').trim(),
        state: String(item.state || '').trim(),
        country: String(item.country || '').trim(),
        industry: String(item.industry || 'Technology').trim(),
        website: String(item.website || '').trim(),
        businessType: String(item.businessType || 'B2B').trim(),
        companySize: String(item.companySize || '10-50').trim(),
        serviceRequired: String(item.serviceRequired || '').trim(),
        currentProject: String(item.currentProject || '').trim(),
        projectDescription: String(item.projectDescription || '').trim(),
        budget: Number(item.budget) || 0,
        expectedRevenue: Number(item.expectedRevenue) || 0,
        startDate: String(item.startDate || '').trim(),
        deadline: String(item.deadline || '').trim(),
        status: item.status || 'New Lead',
        priority: item.priority || 'Medium',
        leadSource: item.leadSource || 'Website',
        assignedTo: String(item.assignedTo || 'John Doe').trim(),
        createdAt: new Date().toISOString(),
      });
    });

    if (errors.length > 0 && validClients.length === 0) {
      return { success: false, addedCount: 0, errors };
    }

    if (validClients.length > 0) {
      await db.insert(clients).values(validClients);
      await dbLogAction(currentUser, 'Batch Records Imported', `Imported ${validClients.length} new client pipeline profiles into database.`);
    }

    return {
      success: true,
      addedCount: validClients.length,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    console.error('Database query failed in batchImportClients:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
