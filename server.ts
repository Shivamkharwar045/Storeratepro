import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateName,
  validateStoreName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
} from './src/utils/validation';
import {
  sortStores,
  sortUsers,
  sortRatings,
  StoreSortKey,
  UserSortKey,
  SortOrder,
} from './src/utils/sorting';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Database file setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  createdAt: string;
}

interface StoreRecord {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  category?: string;
  phone?: string;
  operatingHours?: string;
  imageUrl?: string;
  isVerified?: boolean;
  createdAt: string;
}

interface RatingRecord {
  id: string;
  userId: string;
  storeId: string;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  stores: StoreRecord[];
  ratings: RatingRecord[];
}

const getInitialSeedData = (): DatabaseSchema => {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'usr_admin',
        name: 'System Administrator Roxiler', // 29 chars (20-60 rule)
        email: 'admin@roxiler.com',
        password: 'Admin@123',
        address: '99 Tech Corporate Plaza, Ring Road Square, Bhopal, Madhya Pradesh',
        role: 'ADMIN',
        createdAt: now,
      },
      {
        id: 'usr_owner_abc',
        name: 'Rajesh Kumar Store Owner', // 24 chars
        email: 'owner.abc@gmail.com',
        password: 'Owner@123',
        address: '142 Commercial Market Ring Road, Bhopal, Madhya Pradesh',
        role: 'STORE_OWNER',
        createdAt: now,
      },
      {
        id: 'usr_owner_xyz',
        name: 'Priya Sharma Mart Owner', // 23 chars
        email: 'owner.xyz@gmail.com',
        password: 'Owner@123',
        address: '55 Palasia Square Business Center, Indore, Madhya Pradesh',
        role: 'STORE_OWNER',
        createdAt: now,
      },
      {
        id: 'usr_shivam',
        name: 'Shivam Kharwar Assessment', // 25 chars
        email: 'shivam.kharwar@gmail.com',
        password: 'Shivam@123',
        address: '101 Civil Lines Model Town, Jabalpur, Madhya Pradesh',
        role: 'USER',
        createdAt: now,
      },
      {
        id: 'usr_amit',
        name: 'Amit Vikram Singh Developer', // 27 chars
        email: 'amit.singh@gmail.com',
        password: 'Amit@1234',
        address: '34 Sector B, Arera Colony, Bhopal, Madhya Pradesh',
        role: 'USER',
        createdAt: now,
      },
      {
        id: 'usr_neha',
        name: 'Neha Sunita Patel Reviewer', // 26 chars
        email: 'neha.patel@gmail.com',
        password: 'Neha@1234',
        address: '88 South Tukoganj Avenue, Indore, Madhya Pradesh',
        role: 'USER',
        createdAt: now,
      },
      {
        id: 'usr_rahul',
        name: 'Rahul Devendra Verma Tester', // 27 chars
        email: 'rahul.verma@gmail.com',
        password: 'Rahul@123',
        address: '12 New Subhash Nagar Main, Gwalior, Madhya Pradesh',
        role: 'USER',
        createdAt: now,
      },
    ],
    stores: [
      {
        id: 'str_abc',
        name: 'ABC Supermarket & Electronics',
        email: 'abc.store@retail.com',
        address: '142 Commercial Market Ring Road, Bhopal, Madhya Pradesh',
        ownerId: 'usr_owner_abc',
        category: 'Electronics & Supermarket',
        phone: '+91 755 244 8900',
        operatingHours: 'Open · Closes 10:00 PM',
        imageUrl: '/src/assets/images/store_electronics_supermarket_1791094057760.jpg',
        isVerified: true,
        createdAt: now,
      },
      {
        id: 'str_xyz',
        name: 'XYZ Mega Retail Hub',
        email: 'xyz.store@retail.com',
        address: '55 Palasia Square Business Center, Indore, Madhya Pradesh',
        ownerId: 'usr_owner_xyz',
        category: 'Department Store & Fashion',
        phone: '+91 731 422 1100',
        operatingHours: 'Open · Closes 11:00 PM',
        imageUrl: '/src/assets/images/store_mega_retail_hub_1791094072971.jpg',
        isVerified: true,
        createdAt: now,
      },
      {
        id: 'str_metro',
        name: 'Metro Fresh Hypermarket',
        email: 'metro.fresh@retail.com',
        address: '88 M.G. Road Commercial Complex, Bengaluru, Karnataka',
        ownerId: 'usr_owner_abc',
        category: 'Groceries & Gourmet',
        phone: '+91 80 2558 7700',
        operatingHours: 'Open · Closes 9:30 PM',
        imageUrl: '/src/assets/images/store_hypermarket_fresh_1791094085904.jpg',
        isVerified: true,
        createdAt: now,
      },
      {
        id: 'str_apex',
        name: 'Apex Hardware & Industrial Tools',
        email: 'apex.tools@retail.com',
        address: '12 Industrial Phase 2, Pune, Maharashtra',
        ownerId: 'usr_owner_xyz',
        category: 'Hardware & Industrial Tools',
        phone: '+91 20 2749 3300',
        operatingHours: 'Open · Closes 8:00 PM',
        imageUrl: '/src/assets/images/store_hardware_tools_1791094099176.jpg',
        isVerified: true,
        createdAt: now,
      },
      {
        id: 'str_sunrise',
        name: 'Sunrise Organic Produce & Groceries',
        email: 'sunrise.organic@retail.com',
        address: '73 Green Valley Boulevard, Jaipur, Rajasthan',
        ownerId: 'usr_owner_abc',
        category: 'Organic Goods & Wellness',
        phone: '+91 141 278 4400',
        operatingHours: 'Open · Closes 9:00 PM',
        imageUrl: '/src/assets/images/store_hypermarket_fresh_1791094085904.jpg',
        isVerified: true,
        createdAt: now,
      },
    ],
    ratings: [
      {
        id: 'rtg_1',
        userId: 'usr_shivam',
        storeId: 'str_abc',
        rating: 5,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        id: 'rtg_2',
        userId: 'usr_amit',
        storeId: 'str_abc',
        rating: 4,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      {
        id: 'rtg_3',
        userId: 'usr_neha',
        storeId: 'str_abc',
        rating: 4,
        createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      },
      {
        id: 'rtg_4',
        userId: 'usr_rahul',
        storeId: 'str_abc',
        rating: 5,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'rtg_5',
        userId: 'usr_shivam',
        storeId: 'str_xyz',
        rating: 4,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      },
      {
        id: 'rtg_6',
        userId: 'usr_amit',
        storeId: 'str_xyz',
        rating: 3,
        createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      },
      {
        id: 'rtg_7',
        userId: 'usr_neha',
        storeId: 'str_metro',
        rating: 5,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
  };
};

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    const seed = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Simple in-memory session token store (token -> userId)
const sessions = new Map<string, string>();

// Auth Helper Middleware
function getAuthUser(req: Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;

  const db = readDb();
  // Check if token matches session or is a direct demo user token
  let userId = sessions.get(token);
  if (!userId && token.startsWith('token_')) {
    userId = token.replace('token_', '');
  }
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireRole(roles: Array<'ADMIN' | 'USER' | 'STORE_OWNER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as UserRecord;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden. Access restricted for your role.' });
      return;
    }
    next();
  };
}

// GET /api/schema.sql (PostgreSQL / MySQL Schema download endpoint)
app.get('/api/schema.sql', (req: Request, res: Response) => {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(schemaPath);
  } else {
    res.status(404).send('schema.sql not found');
  }
});

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

  if (!user || user.password !== password) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = `token_${user.id}`;
  sessions.set(token, user.id);

  const { password: _, ...userWithoutPass } = user;
  res.json({
    token,
    user: userWithoutPass,
  });
});

// POST /api/auth/register (Normal User Signup)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, address } = req.body;

  // Validation
  const nameError = validateName(name);
  if (nameError) {
    res.status(400).json({ error: nameError, field: 'name' });
    return;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    res.status(400).json({ error: emailError, field: 'email' });
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    res.status(400).json({ error: passwordError, field: 'password' });
    return;
  }

  const addressError = validateAddress(address);
  if (addressError) {
    res.status(400).json({ error: addressError, field: 'address' });
    return;
  }

  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'A user with this email address already exists.', field: 'email' });
    return;
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    address: address.trim(),
    role: 'USER',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const token = `token_${newUser.id}`;
  sessions.set(token, newUser.id);

  const { password: _, ...userWithoutPass } = newUser;
  res.status(201).json({
    token,
    user: userWithoutPass,
    message: 'Registration successful!',
  });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = (req as any).user as UserRecord;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Both current password and new password are required.' });
    return;
  }

  if (user.password !== oldPassword) {
    res.status(400).json({ error: 'Current password is incorrect.', field: 'oldPassword' });
    return;
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    res.status(400).json({ error: passwordError, field: 'newPassword' });
    return;
  }

  if (oldPassword === newPassword) {
    res.status(400).json({ error: 'New password must be different from the old password.', field: 'newPassword' });
    return;
  }

  const db = readDb();
  const dbUser = db.users.find((u) => u.id === user.id);
  if (dbUser) {
    dbUser.password = newPassword;
    writeDb(db);
  }

  res.json({ message: 'Password updated successfully!' });
});

// -------------------------------------------------------------
// ADMIN ROUTES
// -------------------------------------------------------------

// GET /api/admin/dashboard
app.get('/api/admin/dashboard', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const db = readDb();

  const totalUsers = db.users.length;
  const totalStores = db.stores.length;
  const totalRatings = db.ratings.length;

  const roleBreakdown = {
    admin: db.users.filter((u) => u.role === 'ADMIN').length,
    user: db.users.filter((u) => u.role === 'USER').length,
    storeOwner: db.users.filter((u) => u.role === 'STORE_OWNER').length,
  };

  res.json({
    totalUsers,
    totalStores,
    totalRatings,
    roleBreakdown,
  });
});

// GET /api/admin/users (with search, filter by role, sorting)
app.get('/api/admin/users', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const db = readDb();
  let users = db.users.map(({ password: _, ...u }) => {
    let storeName: string | null = null;
    let storeRating: number | null = null;
    let storeTotalRatings: number = 0;

    if (u.role === 'STORE_OWNER') {
      const store = db.stores.find((s) => s.ownerId === u.id);
      if (store) {
        storeName = store.name;
        const sRatings = db.ratings.filter((r) => r.storeId === store.id);
        storeTotalRatings = sRatings.length;
        storeRating =
          storeTotalRatings > 0
            ? Number((sRatings.reduce((acc, r) => acc + r.rating, 0) / storeTotalRatings).toFixed(1))
            : 0;
      }
    }

    return {
      ...u,
      storeName,
      storeRating,
      storeTotalRatings,
    };
  });

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const roleFilter = typeof req.query.role === 'string' ? req.query.role.trim().toUpperCase() : 'ALL';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  // Filter by role
  if (roleFilter && roleFilter !== 'ALL') {
    users = users.filter((u) => u.role === roleFilter);
  }

  // Search filter by name, email, or address
  if (search) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.address.toLowerCase().includes(search)
    );
  }

  // Use centralized sorting utility
  users = sortUsers(
    users,
    (sortBy as UserSortKey) || 'name',
    sortOrder === -1 ? 'desc' : 'asc'
  );

  res.json({ users, total: users.length });
});

// POST /api/admin/users (Admin Add User)
app.post('/api/admin/users', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { name, email, password, address, role } = req.body;

  const nameError = validateName(name);
  if (nameError) {
    res.status(400).json({ error: nameError, field: 'name' });
    return;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    res.status(400).json({ error: emailError, field: 'email' });
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    res.status(400).json({ error: passwordError, field: 'password' });
    return;
  }

  const addressError = validateAddress(address);
  if (addressError) {
    res.status(400).json({ error: addressError, field: 'address' });
    return;
  }

  const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) {
    res.status(400).json({ error: 'Role must be ADMIN, USER, or STORE_OWNER.', field: 'role' });
    return;
  }

  const db = readDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'A user with this email address already exists.', field: 'email' });
    return;
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    address: address.trim(),
    role,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...userWithoutPass } = newUser;
  res.status(201).json({
    user: userWithoutPass,
    message: 'User created successfully!',
  });
});

// GET /api/admin/stores (with search and sorting)
app.get('/api/admin/stores', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const db = readDb();
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  let stores = db.stores.map((s) => {
    const storeRatings = db.ratings.filter((r) => r.storeId === s.id);
    const totalRatings = storeRatings.length;
    const avg =
      totalRatings > 0
        ? Number((storeRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

    const owner = db.users.find((u) => u.id === s.ownerId);

    return {
      ...s,
      overallRating: avg,
      totalRatings,
      ownerName: owner?.name || 'Unassigned',
    };
  });

  if (search) {
    stores = stores.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.address.toLowerCase().includes(search) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(search))
    );
  }

  // Use centralized sorting utility
  const normalizedSortKey: StoreSortKey =
    sortBy === 'rating' ? 'overallRating' : (sortBy as StoreSortKey) || 'name';

  stores = sortStores(stores, normalizedSortKey, sortOrder === -1 ? 'desc' : 'asc');

  res.json({ stores, total: stores.length });
});

// POST /api/admin/stores (Admin Add Store)
app.post('/api/admin/stores', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { name, email, address, ownerId } = req.body;

  const storeNameError = validateStoreName(name);
  if (storeNameError) {
    res.status(400).json({ error: storeNameError, field: 'name' });
    return;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    res.status(400).json({ error: emailError, field: 'email' });
    return;
  }

  const addressError = validateAddress(address);
  if (addressError) {
    res.status(400).json({ error: addressError, field: 'address' });
    return;
  }

  const db = readDb();
  if (ownerId) {
    const owner = db.users.find((u) => u.id === ownerId && u.role === 'STORE_OWNER');
    if (!owner) {
      res.status(400).json({ error: 'Selected owner must be an existing STORE_OWNER user.', field: 'ownerId' });
      return;
    }
  }

  const newStore: StoreRecord = {
    id: `str_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    address: address.trim(),
    ownerId: ownerId || '',
    createdAt: new Date().toISOString(),
  };

  db.stores.push(newStore);
  writeDb(db);

  res.status(201).json({
    store: {
      ...newStore,
      overallRating: 0,
      totalRatings: 0,
    },
    message: 'Store added successfully!',
  });
});

// -------------------------------------------------------------
// NORMAL USER & PUBLIC STORE LISTING ROUTES
// -------------------------------------------------------------

// GET /api/stores (List all stores with overall rating and user's rating)
app.get('/api/stores', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const db = readDb();

  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  let stores = db.stores.map((s) => {
    const storeRatings = db.ratings.filter((r) => r.storeId === s.id);
    const totalRatings = storeRatings.length;
    const overallRating =
      totalRatings > 0
        ? Number((storeRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

    let userRating: number | null = null;
    let userRatingId: string | null = null;

    if (authUser) {
      const myRating = storeRatings.find((r) => r.userId === authUser.id);
      if (myRating) {
        userRating = myRating.rating;
        userRatingId = myRating.id;
      }
    }

    const owner = db.users.find((u) => u.id === s.ownerId);

    return {
      ...s,
      overallRating,
      totalRatings,
      userRating,
      userRatingId,
      ownerName: owner?.name,
    };
  });

  // User search specifically by Store Name or Address as required by assignment
  if (search) {
    stores = stores.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.address.toLowerCase().includes(search)
    );
  }

  // Use centralized sorting utility
  const normalizedSortKey: StoreSortKey =
    sortBy === 'rating' ? 'overallRating' : (sortBy as StoreSortKey) || 'name';

  stores = sortStores(stores, normalizedSortKey, sortOrder === -1 ? 'desc' : 'asc');

  res.json({ stores, total: stores.length });
});

// POST /api/ratings (Submit or Modify Rating)
// "Agar same user dobara rating deta hai, to new rating create karne ke bajay existing rating update honi chahiye."
app.post('/api/ratings', requireAuth, requireRole(['USER']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const { storeId, rating } = req.body;

  if (!storeId) {
    res.status(400).json({ error: 'Store ID is required.' });
    return;
  }

  const ratingError = validateRating(Number(rating));
  if (ratingError) {
    res.status(400).json({ error: ratingError, field: 'rating' });
    return;
  }

  const db = readDb();
  const store = db.stores.find((s) => s.id === storeId);
  if (!store) {
    res.status(404).json({ error: 'Store not found.' });
    return;
  }

  const existingIndex = db.ratings.findIndex(
    (r) => r.userId === user.id && r.storeId === storeId
  );

  let updatedRecord: RatingRecord;
  let action: 'created' | 'updated';

  if (existingIndex >= 0) {
    // Modify existing rating
    db.ratings[existingIndex].rating = Number(rating);
    db.ratings[existingIndex].updatedAt = new Date().toISOString();
    updatedRecord = db.ratings[existingIndex];
    action = 'updated';
  } else {
    // Create new rating
    updatedRecord = {
      id: `rtg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      storeId,
      rating: Number(rating),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.ratings.push(updatedRecord);
    action = 'created';
  }

  writeDb(db);

  // Recalculate store overall rating
  const storeRatings = db.ratings.filter((r) => r.storeId === storeId);
  const totalRatings = storeRatings.length;
  const overallRating =
    Number((storeRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1));

  res.json({
    rating: updatedRecord,
    overallRating,
    totalRatings,
    action,
    message: action === 'updated' ? 'Rating updated successfully!' : 'Rating submitted successfully!',
  });
});

// GET /api/ratings/my (Get current user's submitted ratings)
app.get('/api/ratings/my', requireAuth, requireRole(['USER']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const db = readDb();

  const myRatings = db.ratings
    .filter((r) => r.userId === user.id)
    .map((r) => {
      const store = db.stores.find((s) => s.id === r.storeId);
      return {
        ...r,
        storeName: store?.name || 'Unknown Store',
        storeAddress: store?.address || '',
      };
    });

  res.json({ ratings: myRatings });
});

// -------------------------------------------------------------
// STORE OWNER ROUTES
// -------------------------------------------------------------

// GET /api/store-owner/dashboard
app.get('/api/store-owner/dashboard', requireAuth, requireRole(['STORE_OWNER']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const db = readDb();

  // Find store owned by this user
  const store = db.stores.find((s) => s.ownerId === user.id) || null;

  if (!store) {
    res.json({
      store: null,
      overallRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      ratings: [],
    });
    return;
  }

  const storeRatings = db.ratings.filter((r) => r.storeId === store.id);
  const totalRatings = storeRatings.length;
  const overallRating =
    totalRatings > 0
      ? Number((storeRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
      : 0;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  storeRatings.forEach((r) => {
    if (ratingDistribution[r.rating as keyof typeof ratingDistribution] !== undefined) {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    }
  });

  const detailedRatings = storeRatings.map((r) => {
    const ratingUser = db.users.find((u) => u.id === r.userId);
    return {
      ...r,
      userName: ratingUser?.name || 'Anonymous User',
      userEmail: ratingUser?.email || '',
      userAddress: ratingUser?.address || '',
    };
  });

  res.json({
    store,
    overallRating,
    totalRatings,
    ratingDistribution,
    ratings: detailedRatings,
  });
});

// GET /api/store-owner/ratings (Users who rated the store)
app.get('/api/store-owner/ratings', requireAuth, requireRole(['STORE_OWNER']), (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const db = readDb();

  const store = db.stores.find((s) => s.ownerId === user.id);
  if (!store) {
    res.json({ ratings: [] });
    return;
  }

  const ratings = db.ratings
    .filter((r) => r.storeId === store.id)
    .map((r) => {
      const ratingUser = db.users.find((u) => u.id === r.userId);
      return {
        ...r,
        userName: ratingUser?.name || 'Anonymous User',
        userEmail: ratingUser?.email || '',
        userAddress: ratingUser?.address || '',
      };
    });

  const sortedRatings = sortRatings(ratings, 'updatedAt', 'desc');

  res.json({ ratings: sortedRatings });
});

  // POST /api/system/reset-demo (Reset database to pristine seed state)
  app.post('/api/system/reset-demo', (req: Request, res: Response) => {
    const seed = getInitialSeedData();
    writeDb(seed);
    res.json({ message: 'Database reset to demo seed state successfully!' });
  });

  // -------------------------------------------------------------
  // VEO VIDEO ANIMATION ROUTES (Storefront & Product Showcase)
  // -------------------------------------------------------------
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.post('/api/video/generate', requireAuth, async (req: Request, res: Response) => {
    const { prompt, imageBase64, mimeType, aspectRatio } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image file is required for video animation.' });
      return;
    }
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'Gemini API key is not configured.' });
      return;
    }
    try {
      const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Cinematic video animation of this retail storefront, high quality commercial motion, slow dynamic pan, crisp detail',
        image: {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: validAspectRatio,
        },
      });

      res.json({ operationName: operation.name });
    } catch (err: any) {
      console.error('Video generation error:', err);
      res.status(500).json({ error: err.message || 'Failed to start video generation.' });
    }
  });

  app.post('/api/video/status', requireAuth, async (req: Request, res: Response) => {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required.' });
      return;
    }
    try {
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done, error: (updated as any).error });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to check video status.' });
    }
  });

  app.post('/api/video/download', requireAuth, async (req: Request, res: Response) => {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required.' });
      return;
    }
    try {
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        res.status(404).json({ error: 'Video URI not found or generation not finished yet.' });
        return;
      }
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
      });
      res.setHeader('Content-Type', 'video/mp4');
      if (videoRes.body) {
        videoRes.body.pipeTo(
          new WritableStream({
            write(chunk) {
              res.write(chunk);
            },
            close() {
              res.end();
            },
          })
        );
      } else {
        const buffer = await videoRes.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to download generated video.' });
    }
  });

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC SERVING INTEGRATION
// -------------------------------------------------------------
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StoreRate Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
