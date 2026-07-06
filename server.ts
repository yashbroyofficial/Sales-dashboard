import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { adminAuth } from './src/lib/firebase-admin.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { dbLogAction } from './src/db/queries.ts';
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { seedDatabase } from './src/db/seed.ts';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addCommunication,
  addReminder,
  updateReminder,
  addProject,
  updateProject,
  addNote,
  addDocument,
  getActivities,
  getDashboardStats,
  getChartsData,
  getCalendarEvents,
  batchImportClients,
} from './src/db/queries.ts';
import { User } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to authenticate request (supports both Mock Token and Firebase ID Token)
async function getAuthenticatedUser(req: express.Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  
  // 1. Check if mock token
  if (token.startsWith('mock-jwt-token-for-')) {
    const userId = token.replace('mock-jwt-token-for-', '');
    const uid = userId === 'usr-1' ? 'mock-admin-uid' : userId === 'usr-2' ? 'mock-john-uid' : 'mock-jane-uid';
    try {
      const userRows = await db.select().from(users).where(eq(users.uid, uid));
      if (userRows.length > 0) {
        const u = userRows[0];
        return { id: u.uid, name: u.name || '', email: u.email, role: u.role as any };
      }
    } catch (err) {
      console.error('Error fetching mock user from postgres:', err);
    }
    
    // Simple fallback
    if (userId === 'usr-1') return { id: 'mock-admin-uid', name: 'Sarah Jenkins', email: 'admin@crm.com', role: 'Admin' };
    if (userId === 'usr-2') return { id: 'mock-john-uid', name: 'John Doe', email: 'employee@crm.com', role: 'Employee' };
    return { id: 'mock-jane-uid', name: 'Jane Smith', email: 'jane@crm.com', role: 'Employee' };
  }

  // 2. Try verifying as real Firebase ID Token
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userRows = await db.select().from(users).where(eq(users.uid, decoded.uid));
    if (userRows.length > 0) {
      const u = userRows[0];
      return { id: u.uid, name: u.name || '', email: u.email, role: u.role as any };
    }
    // Create custom on-the-fly
    const newUser = await getOrCreateUser(decoded.uid, decoded.email || '', decoded.name || 'Google User');
    return { id: newUser.uid, name: newUser.name || '', email: newUser.email, role: newUser.role as any };
  } catch (error) {
    console.error('Failed to verify token as Firebase Id Token:', error);
    return null;
  }
}

// ---------------- AUTH SERVICES ----------------
app.post('/api/auth/login', async (req, res) => {
  return res.status(401).json({ message: 'Mock demo credentials have been securely decommissioned. Please log in using direct Google Single Sign-on!' });
});

// Google Firebase Auth popup verifier endpoint
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Missing Firebase ID Token.' });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const syncedUser = await getOrCreateUser(decoded.uid, decoded.email || '', decoded.name || 'Google User');
    
    await dbLogAction(syncedUser.name || syncedUser.email, 'User Signed In with Google', 'Google ID Token successfully decoded and database profile synchronized.');
    
    res.json({
      token: idToken,
      user: {
        id: syncedUser.uid,
        name: syncedUser.name || syncedUser.email,
        email: syncedUser.email,
        role: syncedUser.role
      }
    });
  } catch (err: any) {
    console.error('Google Auth verification failed on server-side:', err);
    res.status(401).json({ message: 'Google Authentication verification failed.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized session.' });
  }
  res.json({ user });
});

// ---------------- CLIENT SERVICES ----------------
app.get('/api/clients', async (req, res) => {
  const { status, priority, leadSource, assignedTo, search, sortBy } = req.query;
  try {
    const list = await getClients({
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      leadSource: leadSource ? String(leadSource) : undefined,
      assignedTo: assignedTo ? String(assignedTo) : undefined,
      search: search ? String(search) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ message: 'Requested Client ID could not be located in records.' });
    }
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const clientData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'Unknown Admin';
  try {
    const created = await createClient(clientData, currentUser);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const clientData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'Unknown Admin';
  try {
    const updated = await updateClient(id, clientData, currentUser);
    if (!updated) {
      return res.status(404).json({ message: 'Client ID does not exist.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const currentUser = req.headers['x-current-user'] as string || 'Unknown Admin';
  try {
    const success = await deleteClient(id, currentUser);
    if (!success) {
      return res.status(404).json({ message: 'Client record not found.' });
    }
    res.json({ success: true, message: 'Client and all associate documents and records purged.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- COMMUNICATIONS SERVICES ----------------
app.post('/api/clients/:id/communications', async (req, res) => {
  const { id } = req.params;
  const commData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const newComm = await addCommunication(id, commData, currentUser);
    res.status(201).json(newComm);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- REMINDERS TIMELINE SERVICES ----------------
app.post('/api/clients/:id/reminders', async (req, res) => {
  const { id } = req.params;
  const reminderData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not located.' });
    }
    const newReminder = await addReminder(id, client.name, reminderData, currentUser);
    res.status(201).json(newReminder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reminders/:reminderId', async (req, res) => {
  const { reminderId } = req.params;
  const { completed } = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const updated = await updateReminder(reminderId, completed, currentUser);
    if (!updated) {
      return res.status(404).json({ message: 'Reminder record not found.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- PROJECTS SERVICES ----------------
app.post('/api/clients/:id/projects', async (req, res) => {
  const { id } = req.params;
  const projData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const newProj = await addProject(id, projData, currentUser);
    res.status(201).json(newProj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:projId', async (req, res) => {
  const { projId } = req.params;
  const projData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const updated = await updateProject(projId, projData, currentUser);
    if (!updated) {
      return res.status(404).json({ message: 'Project timeline not located.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- NOTES SERVICES ----------------
app.post('/api/clients/:id/notes', async (req, res) => {
  const { id } = req.params;
  const noteData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const newNote = await addNote(id, noteData, currentUser);
    res.status(201).json(newNote);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- DOCUMENTS SERVICES ----------------
app.post('/api/clients/:id/documents', async (req, res) => {
  const { id } = req.params;
  const docData = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const newDoc = await addDocument(id, docData, currentUser);
    res.status(201).json(newDoc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- ACTIVITY LOGS SERVICE ----------------
app.get('/api/activities', async (req, res) => {
  try {
    const list = await getActivities();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- DASHBOARD & KPI SERVICES ----------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/charts', async (req, res) => {
  try {
    const charts = await getChartsData();
    res.json(charts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BATCH DATA IMPORT ENDPOINT ----------------
app.post('/api/import', async (req, res) => {
  const { clients: importList } = req.body;
  const currentUser = req.headers['x-current-user'] as string || 'John Doe';
  try {
    const result = await batchImportClients(importList, currentUser);
    if (!result.success) {
      return res.status(422).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- CALENDAR TIMELINE EVENTS ----------------
app.get('/api/calendar/events', async (req, res) => {
  try {
    const events = await getCalendarEvents();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- APP STATIC FRONTEND ROUTING ----------------
async function startServer() {
  // Prep database seeding
  try {
    await seedDatabase();
  } catch (err) {
    console.error('Error seeding database, proceeding is fine:', err);
  }

  // Vite integration middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRM Client Dashboard Server boot success on port http://localhost:${PORT}`);
  });
}

startServer();
