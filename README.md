# Sierra Leone Grammar School — Student Information Portal

> **"Floreat Regentonia!"** — Est. 1845, Murray Town, Freetown, Sierra Leone

A full-stack simulation of a university-grade school management portal for the Sierra Leone Grammar School (SLGS) — the oldest secondary school in sub-Saharan Africa. Built for demonstration and interview purposes; showcases modern React architecture, role-based access control, financial management workflows, and a production-quality UI.

---

## Live Features by Portal

### 🎓 Student Portal
| Feature | Detail |
|---|---|
| Dashboard | Grades summary, announcements, upcoming meetings |
| My Grades | Per-subject results with grade badges, term filter |
| My Classes | Enrolled subjects with credits and teacher info |
| Messages | Inbox from teachers and administration |
| **My Finance** | Fee statement, financial aid awards, payment history, payment submission form, account hold warnings |
| My Profile | Personal info, academic record, school details |

### 🏫 Academic Secretary / Staff Portal
| Feature | Detail |
|---|---|
| Admissions Register | Issue Admission IDs to new students; track registration status |
| Student Roster | All registered students searchable by name/ID |
| Class Enrolment | Subject enrolment matrix per student |
| **Student Finance** | Full bursar workflow — fee statements, record payments, place/remove holds, award financial aid & bursaries |

### 📋 Teacher Portal
| Feature | Detail |
|---|---|
| Dashboard | Class overview, recent grades |
| Enter Grades | Grade book with per-student score entry |
| Messages | Send/receive messages |
| Live Meetings | Schedule and join virtual class sessions |

### 🏛️ Principal's Office
| Feature | Detail |
|---|---|
| Dashboard | School-wide statistics (1,240 students, 68 teachers, 92.4% pass rate) |
| **Student Registry** | University-style class roster — accordion year-group nav (JSS 1–SS 3), section view (1A/1B/1C), student cards with house colours, financial status badges, account hold indicators, global name search |
| Teachers | Staff directory, subject coverage, vacancy analysis |
| Academic Reports | Per-subject & per-student performance breakdown with term filter |
| Announcements | Full CRUD — post, categorise, filter, delete announcements |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | **React 18** (Create React App) |
| Routing | **React Router v6** (nested protected routes) |
| State | React Context API + `useState` hooks |
| Auth | Role-based Context auth with `localStorage` persistence |
| Icons | **react-icons** v5 (Font Awesome set) |
| Fonts | **Playfair Display** (headings) · **Inter** (body) via Google Fonts |
| Styling | Pure CSS custom properties — no framework |
| Data | In-memory mock data (`src/data/mockData.js`) |
| Build | `react-scripts` 5, `CI=false npm run build` |
| Version Control | Git — `master` (stable) / `develop` (feature work) |

---

## Architecture

```
client/src/
├── App.js                          # Route definitions, role-protected routes
├── context/
│   └── AuthContext.js              # Auth state, login/signup/verifyAdmissionId
├── components/shared/
│   ├── ProtectedRoute.js           # Role-based route guard
│   ├── LandingNav.js               # Public navigation with portal dropdown
│   ├── PortalSidebar.js            # Role-aware sidebar (student/teacher/staff/principal)
│   └── Footer.js                   # 5-column footer with alumni association links
├── pages/
│   ├── Landing.js                  # Public landing page (8 sections)
│   ├── student/
│   │   ├── StudentLogin.js
│   │   ├── StudentSignup.js        # 3-step signup with Admission ID verification
│   │   ├── StudentDashboard.js
│   │   ├── StudentGrades.js
│   │   ├── StudentClasses.js
│   │   ├── StudentMessages.js
│   │   ├── StudentFinance.js       # Fee statement, payments, financial aid, holds
│   │   └── StudentProfile.js
│   ├── teacher/
│   │   ├── TeacherLogin.js
│   │   ├── TeacherDashboard.js
│   │   ├── TeacherGrades.js
│   │   ├── TeacherMessages.js
│   │   └── TeacherMeetings.js
│   ├── staff/
│   │   ├── StaffLogin.js
│   │   └── StaffDashboard.js       # Admissions · Roster · Enrolment · Finance
│   └── principal/
│       ├── PrincipalLogin.js
│       ├── PrincipalDashboard.js
│       ├── PrincipalStudents.js    # Class/section registry (JSS1A → SS3B)
│       ├── PrincipalTeachers.js
│       ├── PrincipalReports.js
│       └── PrincipalAnnouncements.js
├── data/
│   └── mockData.js                 # All in-memory data: users, grades, finance, rosters
└── styles/
    └── index.css                   # ~800-line custom CSS design system
```

---

## Design System

- **Background**: Deep forest green `#0a1a0e`  
- **Primary**: `#1a4731` (dark green panels)  
- **Accent**: `#c9a227` (SLGS gold)  
- **Text**: `#f0ede4` / `#94a3b8` (muted)  
- **Motif**: House colours — Primus (red), Secundus (blue), Tertius (green), Quartius (amber), Quintus (purple)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone git@github.com:cw2636/SLGS.git
cd SLGS/client
npm install
npm start
# Runs at http://localhost:3000
```

### Production Build

```bash
CI=false npm run build
# Output in client/build/ — serve with any static host
```

---

## Demo Credentials

> All data is in-memory. Refreshing the page resets runtime state (holds, payments recorded in session).

| Role | Username | Password | Notes |
|---|---|---|---|
| **Student** | `james.koroma` | `student123` | SS 3A · Primus · has outstanding balance + Hold |
| **Student** | `aminata.sesay` | `student123` | SS 2B · Tertius · account clear · bursary holder |
| **Teacher** | `mr.conteh` | `teacher123` | Mathematics |
| **Teacher** | `mrs.kamara` | `teacher123` | English Language |
| **Secretary** | `ms.johnson` | `staff123` | Head of Records & Admissions (manages all finances) |
| **Secretary** | `mr.bangura` | `staff123` | Admissions Secretary |
| **Principal** | `principal` | `principal123` | Rev. Canon Leonard Ken Davies |

### Student Signup (new account)
Use any Admission ID from the Admissions Register (staff portal). Pre-seeded demo IDs:
- `SLGS-ADM-2025-001` — Emmanuel Turay, SS 1

---

## Key Workflows

### Financial Hold Lifecycle
1. **Secretary** → Staff Portal → Student Finance → select student → Holds tab → Place Hold  
2. **Student** sees red hold banner on Finance page with consequences listed  
3. **Secretary** reviews and removes hold once balance cleared  

### Admission → Registration Flow
1. **Secretary** → Admissions Register → Issue New ID → generate `SLGS-ADM-YYYY-NNN`  
2. Hand ID to student physically  
3. **Student** → Sign Up → enters Admission ID for verification → creates account  

### Financial Aid Award
1. **Secretary** → Finance tab → select student → Financial Aid → Award (auto-deducted from balance)  
2. **Student** sees aid package on My Finance → Financial Aid tab  

---

## Real School Data

All school-specific data sourced from [slgs.edu.sl](http://slgs.edu.sl/):

- **Principal**: Rev. Canon Leonard Ken Davies (M.A. Th. & Min · M.A. Ed. · Dip. Th. · CELTA)
- **Founded**: 25 March 1845 by the Church Mission Society
- **Campus**: 50 acres, Murray Town, west of Freetown
- **Houses**: Primus · Secundus · Tertius · Quartius · Quintus (with Latin mottos)
- **Alumni groups**: UK (regentonians.org) · USA West Coast · USA South East · USA Washington DC
- **Contact**: info@slgs.edu.sl · +232 76 490 656

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `master` | Stable, production-ready code |
| `develop` | Active feature development |

---

*Sierra Leone Grammar School — "Building Excellence" since 1845*
