# ProcurAI - Procurement Management Dashboard System

## Overview

A modern, enterprise-grade Procurement Management Dashboard System designed for mobility and manufacturing organizations. The system provides unified, role-specific dashboards for three distinct stakeholder groups.

## Features

### 🎯 Key Capabilities

- **Multi-source Integration**: Unified view from emails, SAP platforms, and manual indent forms
- **Smart Budget Classification**: Automatic categorization (Under Budget / Over Budget / Pending Allocation)
- **Role-Based Access**: Three distinct dashboards tailored to specific user needs
- **AI-Assisted Decision Making**: Vendor recommendations, spend predictions, and anomaly detection

## Dashboard Roles

### 1. Department Manager Dashboard
**Route:** `/department-manager`

**Features:**
- My Requests table with status tracking
- Submit New Request form
- Budget Overview with alerts
- Notifications center
- Status timeline visualization
- Personal analytics (spend by quarter, approval rate, processing time)

### 2. Procurement Manager Dashboard
**Route:** `/procurement-manager`

**Features:**
- Dashboard overview with KPIs
- Incoming Requests with filtering and bulk actions
- AI vendor recommendation panel
- Vendor Directory with performance ratings
- Contract Pipeline management
- Purchase Orders tracking
- Approvals workflow with SLA metrics

### 3. CFO / Procurement Head Dashboard
**Route:** `/cfo`

**Features:**
- Executive Overview with high-level KPIs
- Budget Analysis with forecast
- Vendor Performance metrics
- Exception Reports
- Strategic Insights with AI-powered predictions
- Category breakdown charts
- Top vendors analysis
- Monthly spend trends

## Design System

### Colors
- **Primary**: Bosch Blue (#005691)
- **Budget Status**:
  - Green: Under Budget
  - Red: Over Budget
  - Amber: Pending Allocation

### Layout
- Persistent left sidebar navigation (collapsible)
- Top bar with search and notifications
- Card-based layouts
- Responsive design (desktop-first, tablet optimized)

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── department-manager/
│   │   ├── procurement-manager/
│   │   └── cfo/
│   └── page.tsx (landing page)
├── components/
│   ├── charts/ (LineChart, BarChart, PieChart)
│   ├── layout/ (DashboardLayout, Sidebar, TopBar)
│   └── ui/ (KPICard, StatusBadge)
├── lib/
│   ├── mockData.ts (sample data)
│   └── utils.ts (utilities)
└── types/
    └── index.ts (TypeScript definitions)
```

## Navigation

1. **Landing Page** (`/`): Role selection screen
2. **Department Manager** (`/department-manager`): Request management interface
3. **Procurement Manager** (`/procurement-manager`): Operational workflow control
4. **CFO Dashboard** (`/cfo`): Strategic oversight and analytics

## Mock Data

The application includes comprehensive mock data for demonstration:
- Sample purchase requests
- Vendor directory
- Contracts
- Purchase orders
- Spend analytics data

All data is located in `lib/mockData.ts` and can be easily replaced with API calls.

## Future Enhancements

- Real-time API integration
- Authentication and authorization
- Advanced filtering and search
- Export functionality (Excel/PDF)
- Real-time notifications
- Workflow automation
- Mobile app version



