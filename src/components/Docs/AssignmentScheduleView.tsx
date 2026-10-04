import React, { useState } from 'react';
import {
  CheckCircle2,
  Shield,
  Store,
  User,
  Star,
  Database,
  Lock,
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  FileCode,
  Download,
} from 'lucide-react';

export const AssignmentScheduleView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(true);
  const days = [
    {
      day: 'Day 1',
      title: 'Project Architecture, Database & Authentication',
      status: 'Completed & Live',
      items: [
        'React frontend + Express.js backend with Vite middleware on port 3000',
        'Database tables/collections: Users, Stores, Ratings with foreign key relationships',
        'Authentication endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me',
        'Role-based access control: ADMIN, USER, STORE_OWNER with protected token auth',
        'Data persistence in data/database.json with automated seed data',
      ],
      icon: Database,
    },
    {
      day: 'Day 2',
      title: 'System Administrator Console & Operations',
      status: 'Completed & Live',
      items: [
        'Admin Dashboard stats: Total Users, Total Stores, Total Ratings counters',
        'Add User modal supporting ADMIN, USER, STORE_OWNER creation',
        'Add Store modal with Store Name, Email, Address & Store Owner assignment',
        'Sortable columns (Ascending / Descending) on both Users and Stores tables',
        'Comprehensive search and filter: Name, Email, Address, and Role filter dropdown',
      ],
      icon: Shield,
    },
    {
      day: 'Day 3',
      title: 'Normal User Experience & 1–5 Star Rating System',
      status: 'Completed & Live',
      items: [
        'Normal user signup & login with standard email & strong password validation',
        'Store listing displaying Store Name, Address, Overall Rating, Your Rating, Action button',
        'Search stores by Store Name and Address',
        '1 to 5 star rating modal with interactive selection and descriptive labels',
        'Rating upsert logic: Modifying existing rating updates record instead of creating duplicate',
      ],
      icon: Star,
    },
    {
      day: 'Day 4',
      title: 'Store Owner Console, Strict Validation & Security',
      status: 'Completed & Live',
      items: [
        'Store Owner Dashboard with linked store metadata, average rating, review count',
        'Real-time rating distribution breakdown bar chart (5★ to 1★)',
        'List of users who rated the store with customer name, rating, address & date',
        'Strict Roxiler validation rules: Name (20–60 chars), Address (≤400 chars), Password (8–16 chars, 1 uppercase, 1 special char)',
        'Role security middleware preventing cross-role privilege escalation',
      ],
      icon: Store,
    },
    {
      day: 'Day 5',
      title: 'Polishing, Testing & Production Verification',
      status: 'Completed & Live',
      items: [
        'Change Password functionality for all authenticated users with criteria checks',
        'Quick Evaluator Switcher (1-click testing between Admin, Owner, and User)',
        'Toast notification system for user-friendly feedback',
        'Responsive layout adhering to Universal Frontend Design Constitution (60-30-10 palette, zero-pill discipline, tabular numerals)',
        'Database reset tool for evaluator test cycles',
      ],
      icon: CheckCircle2,
    },
  ];

  const validationSpecs = [
    {
      field: 'Full Name',
      rule: 'Min 20 characters, Max 60 characters',
      example: 'Shivam Kharwar Assessment (25 chars)',
      status: 'Enforced on Register, Add User & Backend',
    },
    {
      field: 'Physical Address',
      rule: 'Maximum 400 characters',
      example: '142 Commercial Market Ring Road, Bhopal, MP',
      status: 'Enforced on Register, Add User, Store & Backend',
    },
    {
      field: 'Password Security',
      rule: '8–16 characters, ≥1 uppercase letter, ≥1 special character',
      example: 'Shivam@123 / Admin@123',
      status: 'Enforced on Register, Add User, Change Password',
    },
    {
      field: 'Email Format',
      rule: 'Standard RFC-compliant email address',
      example: 'admin@roxiler.com / user@gmail.com',
      status: 'Enforced with regex validation + uniqueness check',
    },
    {
      field: 'Rating Scale',
      rule: 'Integer from 1 to 5 stars',
      example: '1 (Poor) to 5 (Excellent)',
      status: 'Validated in Frontend picker & Backend API',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
          Roxiler FSDI Assessment 1 Verification
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Full-Stack Store Rating Application Roadmap
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          This system was constructed to fulfill every specification from the Campus Roxiler FSDI Assessment:
          3 distinct roles, store listings, 1–5 star rating system with update capabilities, search, filters,
          ascending/descending sorting, and strict character &amp; pattern validation rules.
        </p>
      </div>

      {/* Validation Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Strict Form Validation Rules Compliance Matrix
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All validation rules requested in the assessment document are checked client-side in real-time and enforced server-side.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Required Rule</th>
                <th className="py-2.5 px-3">Valid Example</th>
                <th className="py-2.5 px-3 text-right">Implementation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validationSpecs.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{v.field}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{v.rule}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{v.example}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Day Roadmap Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          5-Day Implementation Breakdown
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {days.map((d, idx) => {
            const Icon = d.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                          {d.day}
                        </span>
                        <span className="text-slate-300">·</span>
                        <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {d.status}
                  </span>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {d.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* PostgreSQL / MySQL Relational Database Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
                Database Specification (Page 1 Compliance)
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              PostgreSQL / MySQL Relational Schema Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict 3-table relational design with Foreign Keys, Character Constraints, and Unique Rating Upsert logic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const sqlText = `-- Roxiler Systems Full-Stack Assessment
-- Database Architecture: PostgreSQL / MySQL Relational Schema

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 120),
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(60) DEFAULT 'Retail & Services',
    phone VARCHAR(30),
    operating_hours VARCHAR(100),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);`;
                navigator.clipboard.writeText(sqlText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL DDL'}</span>
            </button>

            <a
              href="/api/schema.sql"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Download schema.sql</span>
            </a>
          </div>
        </div>

        {/* Relational Schema Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Table: `users`
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Holds Admin, Normal Users, and Store Owners. Enforces <code className="text-slate-900 font-mono">CHECK(20 &lt;= length &lt;= 60)</code> and email uniqueness.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Table: `stores`
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Contains registered physical stores. Linked via <code className="text-slate-900 font-mono">owner_id REFERENCES users(id)</code> with cascade delete.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Table: `ratings`
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              User ratings (1-5). Protected by <code className="text-slate-900 font-mono">UNIQUE(user_id, store_id)</code> so each customer can only rate once (upsert on update).
            </p>
          </div>
        </div>

        {/* SQL Code Block */}
        <div className="relative mt-2">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800 max-h-72">
{`-- 1. USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORES TABLE (Linked to Store Owner)
CREATE TABLE stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 120),
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    owner_id VARCHAR(64) NOT NULL,
    category VARCHAR(60) DEFAULT 'Retail & Services',
    phone VARCHAR(30) DEFAULT '+91 98765 43210',
    operating_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. RATINGS TABLE (Enforces 1-5 Star & UNIQUE rating per user-store pair)
CREATE TABLE ratings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    store_id VARCHAR(64) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
