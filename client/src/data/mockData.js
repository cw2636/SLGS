// ============================================================
// SLGS Mock Data — all in-memory data for the demo portal
// ============================================================

// ── Users ────────────────────────────────────────────────────
// Passwords are NOT stored here. They live in AuthContext.js (MOCK_PASSWORDS).
export const USERS = [
    // Students
    { id: 1, role: 'student', username: 'james.koroma',
      name: 'James Koroma', email: 'james.koroma@slgs.edu.sl',
      studentId: 'SLGS-240101', form: 'SS 3', section: 'A', classSection: 'SS 3A', house: 'Primus', dob: '2008-05-14',
      phone: '+232 76 111 222', guardian: 'Mr. Abu Koroma', address: '12 Wilberforce St, Freetown' },
    { id: 2, role: 'student', username: 'aminata.sesay',
      name: 'Aminata Sesay', email: 'aminata.sesay@slgs.edu.sl',
      studentId: 'SLGS-240102', form: 'SS 2', section: 'B', classSection: 'SS 2B', house: 'Tertius', dob: '2009-02-22',
      phone: '+232 77 333 444', guardian: 'Mrs. Fatima Sesay', address: '5 Pademba Rd, Freetown' },

    // Teachers
    { id: 10, role: 'teacher', username: 'mr.conteh',
      name: 'Mr. David Conteh', email: 'd.conteh@slgs.edu.sl',
      staffId: 'SLGS-T001', subject: 'Mathematics', qualification: 'B.Sc. (Fourah Bay)', experienceYears: 12 },
    { id: 11, role: 'teacher', username: 'mrs.kamara',
      name: 'Mrs. Isatu Kamara', email: 'i.kamara@slgs.edu.sl',
      staffId: 'SLGS-T002', subject: 'English Language', qualification: 'M.A. English (USL)', experienceYears: 9 },

    // Academic Staff (Secretaries / Registrar)
    { id: 30, role: 'staff', username: 'ms.johnson',
      name: 'Ms. Patricia Johnson', email: 'p.johnson@slgs.edu.sl',
      staffId: 'SLGS-S001', department: 'Academic Registrar', title: 'Head of Records & Admissions' },
    { id: 31, role: 'staff', username: 'mr.bangura',
      name: 'Mr. Samuel Bangura', email: 's.bangura@slgs.edu.sl',
      staffId: 'SLGS-S002', department: 'Admissions Office', title: 'Admissions Secretary' },

    // Principal
    { id: 20, role: 'principal', username: 'principal',
      name: 'Rev. Canon Leonard Ken Davies', email: 'principal@slgs.edu.sl',
      title: 'School Principal', qualification: 'M.A. Th. & Min | M.A. Ed. | Dip. Th. | CELTA', since: 2018 },
];

// ── Admitted Students Register ────────────────────────────────
// Maintained by the Admissions Office. Each accepted student is issued an
// Admission ID before they can create a portal account. The secretary
// issues and manages this list.
export const ADMITTED_STUDENTS = [
    { admissionId: 'SLGS-ADM-2024-001', name: 'James Koroma',    form: 'SS 3', dob: '2008-05-14', guardian: 'Mr. Abu Koroma',       registered: true,  studentId: 'SLGS-240101' },
    { admissionId: 'SLGS-ADM-2024-002', name: 'Aminata Sesay',   form: 'SS 2', dob: '2009-02-22', guardian: 'Mrs. Fatima Sesay',    registered: true,  studentId: 'SLGS-240102' },
    { admissionId: 'SLGS-ADM-2025-001', name: 'Emmanuel Turay',  form: 'SS 1', dob: '2010-08-03', guardian: 'Mr. Charles Turay',    registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2025-002', name: 'Kadija Kamara',   form: 'JSS 3', dob: '2011-01-17', guardian: 'Mrs. Hawa Kamara',   registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2025-003', name: 'Ibrahim Sesay',   form: 'SS 2', dob: '2009-11-25', guardian: 'Mr. Sorie Sesay',     registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2025-004', name: 'Mariama Bangura', form: 'JSS 1', dob: '2013-04-09', guardian: 'Mrs. AI Bangura',    registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2025-005', name: 'Mohamed Koroma',  form: 'SS 3', dob: '2008-07-21', guardian: 'Mr. Brima Koroma',    registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2026-001', name: 'Fatima Cole',     form: 'JSS 1', dob: '2014-03-15', guardian: 'Mr. John Cole',      registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2026-002', name: 'David Palmer',    form: 'JSS 2', dob: '2012-09-08', guardian: 'Mrs. Agnes Palmer',  registered: false, studentId: null },
    { admissionId: 'SLGS-ADM-2026-003', name: 'Sarah Williams',  form: 'SS 1', dob: '2010-06-12', guardian: 'Rev. Peter Williams', registered: false, studentId: null },
];

// ── Subjects ─────────────────────────────────────────────────
export const SUBJECTS = [
    { id: 'MTH', name: 'Mathematics',      teacher: 'Mr. Conteh',   credits: 4 },
    { id: 'ENG', name: 'English Language', teacher: 'Mrs. Kamara',  credits: 4 },
    { id: 'PHY', name: 'Physics',          teacher: 'Mr. Johnson',  credits: 3 },
    { id: 'CHM', name: 'Chemistry',        teacher: 'Ms. Bangura',  credits: 3 },
    { id: 'BIO', name: 'Biology',          teacher: 'Mr. Sesay',    credits: 3 },
    { id: 'GEO', name: 'Geography',        teacher: 'Mrs. Fofanah', credits: 2 },
    { id: 'HIS', name: 'History',          teacher: 'Mr. Turay',    credits: 2 },
    { id: 'FRE', name: 'French',           teacher: 'Ms. Diallo',   credits: 2 },
    { id: 'ITC', name: 'ICT',             teacher: 'Mr. Cole',     credits: 2 },
    { id: 'REL', name: 'Religious Studies',teacher: 'Rev. Moore',   credits: 2 },
];

// ── Student Grades ────────────────────────────────────────────
export const STUDENT_GRADES = {
    'SLGS-240101': [
        { subject: 'Mathematics',      term: 'Term 1', score: 88, grade: 'A', comments: 'Excellent work, strong algebra skills.' },
        { subject: 'English Language', term: 'Term 1', score: 82, grade: 'A', comments: 'Good essay structure. Work on vocabulary.' },
        { subject: 'Physics',          term: 'Term 1', score: 75, grade: 'B', comments: 'Solid understanding of mechanics.' },
        { subject: 'Chemistry',        term: 'Term 1', score: 79, grade: 'B', comments: 'Good lab work. Revise periodic table.' },
        { subject: 'Biology',          term: 'Term 1', score: 91, grade: 'A*', comments: 'Exceptional — top of class.' },
        { subject: 'History',          term: 'Term 1', score: 68, grade: 'B', comments: 'More detail needed in essay answers.' },
        { subject: 'Mathematics',      term: 'Term 2', score: 92, grade: 'A*', comments: 'Outstanding improvement in calculus.' },
        { subject: 'English Language', term: 'Term 2', score: 85, grade: 'A', comments: 'Strong creative writing this term.' },
        { subject: 'Physics',          term: 'Term 2', score: 80, grade: 'A', comments: 'Good understanding of electromagnetism.' },
        { subject: 'Chemistry',        term: 'Term 2', score: 83, grade: 'A', comments: 'Excellent practical performance.' },
        { subject: 'Biology',          term: 'Term 2', score: 94, grade: 'A*', comments: 'Maintain this standard for WASSCE.' },
        { subject: 'History',          term: 'Term 2', score: 74, grade: 'B', comments: 'Much improved analytical writing.' },
    ],
    'SLGS-240102': [
        { subject: 'Mathematics',      term: 'Term 1', score: 71, grade: 'B', comments: 'Good foundation. Practice more problems.' },
        { subject: 'English Language', term: 'Term 1', score: 90, grade: 'A*', comments: 'Exceptional literary analysis.' },
        { subject: 'Physics',          term: 'Term 1', score: 65, grade: 'C', comments: 'Needs to review wave theory.' },
        { subject: 'French',           term: 'Term 1', score: 88, grade: 'A', comments: 'Near-native proficiency. Excellent.' },
        { subject: 'Geography',        term: 'Term 1', score: 85, grade: 'A', comments: 'Strong fieldwork report.' },
    ],
};

// ── Registered Classes ────────────────────────────────────────
export const ENROLLED_CLASSES = {
    'SLGS-240101': ['MTH', 'ENG', 'PHY', 'CHM', 'BIO', 'HIS'],
    'SLGS-240102': ['MTH', 'ENG', 'PHY', 'FRE', 'GEO'],
};

// ── Messages ─────────────────────────────────────────────────
export const MESSAGES = [
    { id: 1, from: 'Mr. David Conteh', fromRole: 'teacher', to: 'james.koroma',
      subject: 'Mathematics Extra Class', date: '2026-04-05',
      body: 'Dear James, there will be an extra revision class this Saturday at 9am in Room 12. Please bring your past papers. Regards, Mr. Conteh.' },
    { id: 2, from: 'Rev. Kenneth Davies', fromRole: 'principal', to: 'james.koroma',
      subject: 'Term 2 Prize Giving Day', date: '2026-04-03',
      body: 'Dear James, you have been selected to receive the Science Prize at the upcoming Prize Giving Day on 18 April. Congratulations. — The Principal' },
    { id: 3, from: 'Mrs. Isatu Kamara', fromRole: 'teacher', to: 'james.koroma',
      subject: 'Essay Submission Reminder', date: '2026-04-01',
      body: 'This is a reminder that your argumentative essay is due next Monday. Please ensure proper citation.' },
    { id: 4, from: 'Mr. David Conteh', fromRole: 'teacher', to: 'aminata.sesay',
      subject: 'Maths Improvement', date: '2026-04-04',
      body: 'Dear Aminata, I have noticed some gaps in algebra. Please come to my office on Thursday for extra support.' },
];

// ── Teacher Grade Book ────────────────────────────────────────
export const GRADE_BOOK = [
    { studentId: 'SLGS-240101', studentName: 'James Koroma',   form: 'SS 3', subject: 'Mathematics', term: 'Term 2', score: 92, grade: 'A*' },
    { studentId: 'SLGS-240102', studentName: 'Aminata Sesay',  form: 'SS 2', subject: 'Mathematics', term: 'Term 2', score: 71, grade: 'B' },
    { studentId: 'SLGS-240103', studentName: 'Mohamed Turay',  form: 'SS 3', subject: 'Mathematics', term: 'Term 2', score: 65, grade: 'C' },
    { studentId: 'SLGS-240104', studentName: 'Fatima Bangura', form: 'SS 3', subject: 'Mathematics', term: 'Term 2', score: 80, grade: 'A' },
    { studentId: 'SLGS-240105', studentName: 'Ibrahim Kamara', form: 'SS 2', subject: 'Mathematics', term: 'Term 2', score: 55, grade: 'D' },
    { studentId: 'SLGS-240106', studentName: 'Mariama Cole',   form: 'SS 2', subject: 'Mathematics', term: 'Term 2', score: 88, grade: 'A' },
];

// ── Meetings ─────────────────────────────────────────────────
export const MEETINGS = [
    { id: 1, title: 'SS3 Mathematics Revision', date: '2026-04-12', time: '09:00', duration: '60 min',
      roomId: 'ss3-mathematics-revision', attendees: ['SS 3 Mathematics Students'], host: 'Mr. David Conteh', status: 'upcoming' },
    { id: 2, title: 'Parent-Teacher Consultation', date: '2026-04-15', time: '14:00', duration: '30 min',
      roomId: 'parent-teacher-consultation', attendees: ['SS 3 Parents'], host: 'Mr. David Conteh', status: 'upcoming' },
    { id: 3, title: 'End-of-Term Review', date: '2026-03-28', time: '11:00', duration: '45 min',
      roomId: 'end-of-term-review', attendees: ['All SS 3 Students'], host: 'Mr. David Conteh', status: 'completed' },
];

// ── Announcements ─────────────────────────────────────────────
export const ANNOUNCEMENTS = [
    { id: 1, title: 'WASSCE Registration Open', date: '2026-04-01', category: 'Examinations',
      body: 'All SS 3 students must complete WASSCE registration by April 30. See the examination office.' },
    { id: 2, title: 'Prize Giving Day — 18 April', date: '2026-03-28', category: 'Events',
      body: 'Annual Prize Giving Day will be held on Saturday 18 April. All students must be in full uniform.' },
    { id: 3, title: 'Inter-House Sports Day', date: '2026-03-20', category: 'Sports',
      body: 'Sports Day will take place on the school field on 25 April. All houses should register athletes by 15 April.' },
    { id: 4, title: 'Library Expansion Complete', date: '2026-03-10', category: 'Facilities',
      body: 'The newly expanded school library is now open with 2,000 new titles. Students may borrow up to 3 books at a time.' },
];

// ── Houses ───────────────────────────────────────────────────
// Source: slgs.edu.sl/houses — the school has five houses
export const HOUSES = [
    { name: 'Primus',   motto: 'Primus inter pares',   color: '#ef4444', captain: 'Mohamed H. Mansaray' },
    { name: 'Secundus', motto: 'Nulli secundus',        color: '#3b82f6', captain: 'TBC' },
    { name: 'Tertius',  motto: 'Ter Felix',             color: '#22c55e', captain: 'Mohamed R. Thomas', houseTeacher: 'Mrs. Isabella Campbell' },
    { name: 'Quartius', motto: 'Quartius fortiores',    color: '#f59e0b', captain: 'TBC',              houseTeacher: 'Miss Hawa Kargbo' },
    { name: 'Quintus',  motto: 'Quintus',               color: '#8b5cf6', captain: 'Sylvanus M. Fannah', houseTeacher: 'Rev. Pinkney Wilhelm' },
];

// ── Alumni Associations ──────────────────────────────────────
// Alumni are known as "Regentonians"
export const ALUMNI_GROUPS = [
    { name: 'Local Sierra Leone',      url: 'http://slgs.edu.sl/alumni-sl/' },
    { name: 'UK — Regentonians',       url: 'http://www.regentonians.org/' },
    { name: 'USA — West Coast',        url: 'https://slgsaana-westcoast.org/' },
    { name: 'USA — South East',        url: 'https://slgsaanase.org/' },
    { name: 'USA — Washington DC',     url: 'http://slgsaanadc.org/' },
];

// ── Clubs & Societies ──────────────────────────────────────────
export const CLUBS = [
    'School Choir', 'Interact Club (Community Service)', 'Science & Innovation Club',
    'Scripture Union', 'Souls of Africa Youth Leadership (SOA)',
    'Nature Club', 'UNESCO Club', 'Campus Peace Club',
    'Benjamin Carson Reading Club', 'Regentonian News Journal', 'Integrity Club',
];

// ── Sports ───────────────────────────────────────────────────
export const SPORTS = [
    'Football', 'Basketball', 'Cricket', 'Volleyball', 'Squash', 'Hand Tennis', 'Table Tennis',
];

// ── Principal Stats ───────────────────────────────────────────
export const SCHOOL_STATS = {
    totalStudents:  1240,
    totalTeachers:  68,
    totalStaff:     95,
    classrooms:     34,
    campusAcres:    50,
    formsOffered:   ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'],
    passRate:       92.4,
    scholarships:   18,
    currentTerm:    'Term 2, 2025/2026',
    schoolDay:      '08:10 – 15:15 (Assembly 08:10, Lessons 08:45)',
};

// ── News items ────────────────────────────────────────────────
// These are defaults. IT admin can override via localStorage key 'slgs_it_news'
export const NEWS = [
    {
        id: 1,
        title: 'Annual Prize Giving & Speech Day 2025',
        date: 'March 2025',
        summary: 'SLGS held its prestigious Speech and Prize Giving Day, honouring top performers with subject prizes, house awards, and the coveted Headmaster\'s Prize. Alumni, parents, and distinguished guests packed the hall in proud attendance of the school\'s finest tradition.',
        category: 'Events',
        // Students in uniform at Freetown secondary school — Wikimedia Commons, Public Domain
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Jill_Biden_visits_St._Joseph%27s_Secondary_School%2C_Freetown%2C_Sierra_Leone_%282014-07-07%29_04.jpg',
    },
    {
        id: 2,
        title: '180 Years of Excellence — Founders\' Day',
        date: '25 March 2025',
        summary: 'SLGS marked its 180th founding anniversary with a solemn Thanksgiving Service at historic St George\'s Cathedral, Freetown — commemorating the day CMS opened Africa\'s first secondary school on 25 March 1845 under Rev. Thomas Peyton.',
        category: 'Anniversary',
        // SLGS official school crest/shield — Wikipedia, fair use
        image: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Sierra_Leone_Grammar_School_shield.jpg',
    },
    {
        id: 3,
        title: 'WASSCE 2024: Outstanding National Results',
        date: 'November 2024',
        summary: 'SLGS students delivered exceptional results in the 2024 WAEC WASSCE examinations. Top achievers earned A grades across Biology, Chemistry, Physics, Mathematics and Literature — reinforcing the school\'s 180-year reputation as a national centre of excellence.',
        category: 'Achievement',
        // Sierra Leone school award ceremony, 2024 — Wikimedia Commons, CC0
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/2024_SL_National_winner_Kelmond_Preparotory_School_with_OSLF_Director_and_team.jpg',
    },
    {
        id: 4,
        title: 'Thanksgiving Service at St George\'s Cathedral',
        date: 'January 2025',
        summary: 'Students, staff and Old Boys gathered at the historic St George\'s Cathedral, Freetown, for the annual Thanksgiving Service — a cherished Regentonian tradition rooted in the school\'s Anglican founding. The service opened the new academic year with prayer and reflection.',
        category: 'Faith & Tradition',
        // St George\' Cathedral, Freetown — Wikimedia Commons, CC BY-SA 4.0
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/St._George%27s_Cathedral_Freetown.jpg',
    },
    {
        id: 5,
        title: 'Inter-House Sports Day 2025',
        date: 'February 2025',
        summary: 'The annual Inter-House Sports Day ignited fierce but friendly competition across all four houses. Track events, relay races, and field sports drew enthusiastic crowds, with students demonstrating the same spirit of discipline and excellence that defines life at SLGS.',
        category: 'Sports',
        // Students waving at Freetown secondary school — Wikimedia Commons, Public Domain
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Jill_Biden_visits_St._Joseph%27s_Secondary_School%2C_Freetown%2C_Sierra_Leone_%282014-07-07%29_05.jpg',
    },
    {
        id: 6,
        title: 'SLGS Marching Band: 113 Years Strong',
        date: 'April 2025',
        summary: 'Founded in 1912, the SLGS marching band — one of the oldest in West Africa — performed at national independence celebrations. The band remains a proud emblem of the school\'s heritage, discipline, and cultural identity across generations of Regentonians.',
        category: 'Heritage',
        // 2024 Sierra Leone school celebration ceremony — Wikimedia Commons, CC0
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/2024_Celebration_of_the_WikiChallenge_winners_at_the_Orange_HQ.jpg',
    },
];

// ── Events Gallery ────────────────────────────────────────────
// Defaults. IT admin can override via localStorage key 'slgs_it_gallery'
export const GALLERY_DEFAULT = [
    // All images: real Wikimedia Commons photos from Sierra Leone / Freetown (free license)
    { id: 1, title: 'Prize Giving & Speech Day', date: 'March 2025',
      caption: 'Top students receive their awards at the annual ceremony',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Jill_Biden_visits_St._Joseph%27s_Secondary_School%2C_Freetown%2C_Sierra_Leone_%282014-07-07%29_04.jpg' },
    { id: 2, title: "Founders' Day Thanksgiving", date: '25 Mar 2025',
      caption: '180th anniversary — St George\'s Cathedral, Freetown, Anglican Diocese',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/St._George%27s_Cathedral_Freetown.jpg' },
    { id: 3, title: 'Inter-House Sports Day', date: 'Feb 2025',
      caption: 'Students compete across all four houses in track and field athletics',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Jill_Biden_visits_St._Joseph%27s_Secondary_School%2C_Freetown%2C_Sierra_Leone_%282014-07-07%29_05.jpg' },
    { id: 4, title: 'WASSCE Top Achievers 2024', date: 'Nov 2024',
      caption: 'Sierra Leone school award ceremony — celebrating academic excellence',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/2024_SL_National_winner_Kelmond_Preparotory_School_with_OSLF_Director_and_team.jpg' },
    { id: 5, title: 'Annual Thanksgiving Service', date: 'Jan 2025',
      caption: 'Year-opening worship at St George\'s Cathedral, seat of the Anglican Diocese of Freetown',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/St._George%27s_Cathedral_Freetown.jpg' },
    { id: 6, title: 'Independence Day Parade', date: 'April 2025',
      caption: 'The SLGS Marching Band at national independence celebrations, Freetown',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/2024_Celebration_of_the_WikiChallenge_winners_at_the_Orange_HQ.jpg' },
    { id: 7, title: 'Science Fair 2025', date: 'March 2025',
      caption: 'Student innovations showcased at the annual science exhibition',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Jill_Biden_visits_Freetown%2C_Sierra_Leone_%282014-07%29_03.jpg' },
    { id: 8, title: 'SLGS Annual Gathering', date: 'Feb 2025',
      caption: 'Regentonians — staff, students and alumni — at the school\'s annual gathering',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Aberdeen%2C_Freetown%2C_Sierra_Leone_-_panoramio.jpg' },
];

// Grade helpers
export const scoreToGrade = (score) => {
    if (score >= 90) return 'A*';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
};

export const gradeColor = (g) => {
    if (g === 'A*') return '#86efac';
    if (g === 'A')  return '#bef264';
    if (g === 'B')  return '#fde047';
    if (g === 'C')  return '#fdba74';
    return '#fca5a5';
};

// ── Class Sections ────────────────────────────────────────────
// Each form (year group) is split into named sections (A, B, C)
export const CLASS_SECTIONS = {
    'JSS 1': ['JSS 1A', 'JSS 1B', 'JSS 1C'],
    'JSS 2': ['JSS 2A', 'JSS 2B', 'JSS 2C'],
    'JSS 3': ['JSS 3A', 'JSS 3B'],
    'SS 1':  ['SS 1A',  'SS 1B'],
    'SS 2':  ['SS 2A',  'SS 2B'],
    'SS 3':  ['SS 3A',  'SS 3B'],
};

// Full class rosters keyed by section.
// hasAccount=true means the student has a portal USERS entry.
export const CLASS_ROSTER = {
    'JSS 1A': [
        { id:'R101', name:'Mariama Bangura',  house:'Secundus', hasAccount:false },
        { id:'R102', name:'Fatima Cole',      house:'Primus',   hasAccount:false },
        { id:'R103', name:'Abu Koroma Jr.',   house:'Quintus',  hasAccount:false },
        { id:'R104', name:'Samuel Turay',     house:'Quartius', hasAccount:false },
        { id:'R105', name:'Hawa Kargbo',      house:'Tertius',  hasAccount:false },
        { id:'R106', name:'Emmanuel Conteh',  house:'Primus',   hasAccount:false },
        { id:'R107', name:'Isata Sesay',      house:'Secundus', hasAccount:false },
        { id:'R108', name:'Brima Kamara',     house:'Quintus',  hasAccount:false },
    ],
    'JSS 1B': [
        { id:'R111', name:'Kadijah Fofanah',  house:'Tertius',  hasAccount:false },
        { id:'R112', name:'Mohamed Koroma',   house:'Primus',   hasAccount:false },
        { id:'R113', name:'Agnes Williams',   house:'Quartius', hasAccount:false },
        { id:'R114', name:'David Palmer',     house:'Secundus', hasAccount:false },
        { id:'R115', name:'Zainab Bangura',   house:'Quintus',  hasAccount:false },
        { id:'R116', name:'Peter Turay',      house:'Primus',   hasAccount:false },
        { id:'R117', name:'Aminata Koroma',   house:'Tertius',  hasAccount:false },
    ],
    'JSS 1C': [
        { id:'R121', name:'Ibrahim Dumbuya',  house:'Secundus', hasAccount:false },
        { id:'R122', name:'Fatmata Sesay',    house:'Quartius', hasAccount:false },
        { id:'R123', name:'Joseph Bah',       house:'Quintus',  hasAccount:false },
        { id:'R124', name:'Mary Kamara',      house:'Primus',   hasAccount:false },
        { id:'R125', name:'Alieu Diallo',     house:'Tertius',  hasAccount:false },
    ],
    'JSS 2A': [
        { id:'R201', name:'Sorie Kamara',     house:'Primus',   hasAccount:false },
        { id:'R202', name:'Bintu Sesay',      house:'Secundus', hasAccount:false },
        { id:'R203', name:'Abdulai Bangura',  house:'Tertius',  hasAccount:false },
        { id:'R204', name:'Grace Koroma',     house:'Quartius', hasAccount:false },
        { id:'R205', name:'Lansana Cole',     house:'Quintus',  hasAccount:false },
        { id:'R206', name:'Kadija Kamara',    house:'Primus',   hasAccount:false },
    ],
    'JSS 2B': [
        { id:'R211', name:'Daniel Williams',  house:'Secundus', hasAccount:false },
        { id:'R212', name:'Fanta Turay',      house:'Tertius',  hasAccount:false },
        { id:'R213', name:'John Fofanah',     house:'Quartius', hasAccount:false },
        { id:'R214', name:'David Palmer Jr.', house:'Quintus',  hasAccount:false },
        { id:'R215', name:'Sarah Williams',   house:'Primus',   hasAccount:false },
    ],
    'JSS 2C': [
        { id:'R221', name:'Moses Conteh',     house:'Tertius',  hasAccount:false },
        { id:'R222', name:'Agnes Kargbo',     house:'Primus',   hasAccount:false },
        { id:'R223', name:'Abdul Sesay',      house:'Secundus', hasAccount:false },
        { id:'R224', name:'Mariatu Koroma',   house:'Quintus',  hasAccount:false },
    ],
    'JSS 3A': [
        { id:'R301', name:'Emmanuel Turay',   house:'Quartius', hasAccount:false },
        { id:'R302', name:'Fatima Bangura',   house:'Tertius',  hasAccount:false },
        { id:'R303', name:'Ibrahim Sesay',    house:'Secundus', hasAccount:false },
        { id:'R304', name:'Sophie Kamara',    house:'Primus',   hasAccount:false },
        { id:'R305', name:'Patrick Williams', house:'Quintus',  hasAccount:false },
        { id:'R306', name:'Hawa Bangura',     house:'Quartius', hasAccount:false },
        { id:'R307', name:'Alfred Koroma',    house:'Primus',   hasAccount:false },
    ],
    'JSS 3B': [
        { id:'R311', name:'Ramatu Sesay',     house:'Tertius',  hasAccount:false },
        { id:'R312', name:'Alie Turay',       house:'Secundus', hasAccount:false },
        { id:'R313', name:'Fatmata Cole',     house:'Quintus',  hasAccount:false },
        { id:'R314', name:'John Bangura',     house:'Primus',   hasAccount:false },
        { id:'R315', name:'Mary Fofanah',     house:'Quartius', hasAccount:false },
    ],
    'SS 1A': [
        { id:'R401', name:'Isatu Koroma',     house:'Primus',   hasAccount:false },
        { id:'R402', name:'Amara Kamara',     house:'Secundus', hasAccount:false },
        { id:'R403', name:'Fatima Sesay',     house:'Tertius',  hasAccount:false },
        { id:'R404', name:'Brima Williams',   house:'Quartius', hasAccount:false },
        { id:'R405', name:'Mary Cole',        house:'Quintus',  hasAccount:false },
        { id:'R406', name:'Luke Bangura',     house:'Primus',   hasAccount:false },
    ],
    'SS 1B': [
        { id:'R411', name:'Mohamed Conteh',   house:'Tertius',  hasAccount:false },
        { id:'R412', name:'Abibatu Turay',    house:'Quintus',  hasAccount:false },
        { id:'R413', name:'David Koroma',     house:'Secundus', hasAccount:false },
        { id:'R414', name:'Sarah Bangura',    house:'Primus',   hasAccount:false },
        { id:'R415', name:'Emmanuel Sesay',   house:'Quartius', hasAccount:false },
    ],
    'SS 2A': [
        { id:'R501', name:'Sorie Williams',   house:'Quintus',  hasAccount:false },
        { id:'R502', name:'Hawa Kamara',      house:'Primus',   hasAccount:false },
        { id:'R503', name:'Patrick Sesay',    house:'Secundus', hasAccount:false },
        { id:'R504', name:'Kadijah Turay',    house:'Tertius',  hasAccount:false },
    ],
    'SS 2B': [
        { id:'2',    name:'Aminata Sesay',    house:'Tertius',  hasAccount:true,  studentId:'SLGS-240102', username:'aminata.sesay' },
        { id:'R511', name:'Ibrahim Cole',     house:'Quartius', hasAccount:false },
        { id:'R512', name:'Fatima Williams',  house:'Primus',   hasAccount:false },
        { id:'R513', name:'Amara Bangura',    house:'Secundus', hasAccount:false },
        { id:'R514', name:'Binta Kamara',     house:'Quintus',  hasAccount:false },
    ],
    'SS 3A': [
        { id:'1',    name:'James Koroma',     house:'Primus',   hasAccount:true,  studentId:'SLGS-240101', username:'james.koroma' },
        { id:'R601', name:'Mohamed Turay',    house:'Secundus', hasAccount:false },
        { id:'R602', name:'Fatima Bangura',   house:'Quartius', hasAccount:false },
        { id:'R603', name:'Ibrahim Kamara',   house:'Quintus',  hasAccount:false },
        { id:'R604', name:'Mariama Cole',     house:'Tertius',  hasAccount:false },
        { id:'R605', name:'Alie Sesay',       house:'Primus',   hasAccount:false },
        { id:'R606', name:'Agnes Conteh',     house:'Secundus', hasAccount:false },
        { id:'R607', name:'Samuel Bangura',   house:'Quartius', hasAccount:false },
    ],
    'SS 3B': [
        { id:'R611', name:'Isatu Williams',   house:'Quintus',  hasAccount:false },
        { id:'R612', name:'Modibo Fofanah',   house:'Primus',   hasAccount:false },
        { id:'R613', name:'Fanta Koroma',     house:'Tertius',  hasAccount:false },
        { id:'R614', name:'Brima Turay',      house:'Secundus', hasAccount:false },
        { id:'R615', name:'Kadijah Sesay',    house:'Quartius', hasAccount:false },
    ],
};

// ── Financial Accounts ────────────────────────────────────────
// Managed by the Academic Secretary / Bursar
// All amounts in Sierra Leone Leones (SLL)
export const FINANCIAL_ACCOUNTS = {
    'SLGS-240101': {
        studentId:    'SLGS-240101',
        studentName:  'James Koroma',
        form:         'SS 3A',
        termFee:       850000,
        examFee:       250000,
        labFee:         50000,
        sportsFee:      40000,
        otherFees:      30000,
        totalCharged: 1220000,
        totalPaid:     650000,
        scholarshipApplied: 200000,
        balance:       370000,   // still owed after aid applied
        dueDate:      '2026-05-15',
        term:         'Term 2, 2025/2026',
        currency:     'SLL',
        academicYear: '2025/2026',
        status:       'outstanding',
    },
    'SLGS-240102': {
        studentId:    'SLGS-240102',
        studentName:  'Aminata Sesay',
        form:         'SS 2B',
        termFee:       850000,
        examFee:         0,
        labFee:         50000,
        sportsFee:      40000,
        otherFees:      30000,
        totalCharged:  970000,
        totalPaid:     970000,
        scholarshipApplied: 450000, // bursary covered most
        balance:         0,
        dueDate:      '2026-05-15',
        term:         'Term 2, 2025/2026',
        currency:     'SLL',
        academicYear: '2025/2026',
        status:       'clear',
    },
};

// ── Account Holds ─────────────────────────────────────────────
// Placed by secretary. Prevents access to results/certificates.
export const HOLDS = [
    {
        id: 1,
        studentId:   'SLGS-240101',
        type:        'Financial',
        reason:      'Outstanding balance of SLL 370,000 for Term 2, 2025/2026',
        placedBy:    'Ms. Patricia Johnson',
        placedDate:  '2026-04-01',
        resolvedDate: null,
        active:       true,
        consequence: 'Results withheld. Exam registration blocked until balance is cleared.',
    },
];

// ── Payment Records ───────────────────────────────────────────
export const PAYMENTS = [
    { id:1, studentId:'SLGS-240101', amount:400000, method:'Bank Transfer (Guarantee Trust)', reference:'GT-20260110-881', date:'2026-01-10', recordedBy:'Ms. Patricia Johnson', description:'Term 2 partial payment — instalment 1' },
    { id:2, studentId:'SLGS-240101', amount:250000, method:'Mobile Money (Orange Sierra Leone)', reference:'OM-20260215-447', date:'2026-02-15', recordedBy:'Ms. Patricia Johnson', description:'Term 2 partial payment — instalment 2' },
    { id:3, studentId:'SLGS-240102', amount:970000, method:'Bank Transfer (Guarantee Trust)', reference:'GT-20260108-002', date:'2026-01-08', recordedBy:'Mr. Samuel Bangura', description:'Term 2 full payment' },
    { id:4, studentId:'SLGS-240101', amount:350000, method:'Bank Transfer',                   reference:'GT-20250906-331', date:'2025-09-06', recordedBy:'Ms. Patricia Johnson', description:'Term 1 full payment' },
    { id:5, studentId:'SLGS-240102', amount:900000, method:'Mobile Money (Africell)',          reference:'AF-20250905-112', date:'2025-09-05', recordedBy:'Mr. Samuel Bangura', description:'Term 1 full payment' },
];

// ── Financial Aid / Bursaries ─────────────────────────────────
export const FINANCIAL_AID = [
    {
        id: 1,
        studentId:    'SLGS-240101',
        type:         'Merit Scholarship',
        amount:        200000,
        academicYear: '2025/2026',
        status:       'Active',
        description:  'Awarded for exceptional WASSCE performance — top 5% nationally. Applied directly to Term 2 fee.',
        awardedBy:    'Principal — Rev. Canon Leonard Ken Davies',
        awardedDate:  '2025-09-01',
        renewable:     true,
    },
    {
        id: 2,
        studentId:    'SLGS-240102',
        type:         'Welfare Bursary',
        amount:        450000,
        academicYear: '2025/2026',
        status:       'Active',
        description:  'Financial hardship bursary approved by the Welfare Committee. Covers 46% of Term 2 fees.',
        awardedBy:    'Ms. Patricia Johnson — Academic Registrar',
        awardedDate:  '2025-09-15',
        renewable:     false,
    },
];


// ============================================================
// LMS — Course / Module Data
// ============================================================

// ── Courses (map subject id → course detail) ─────────────────
export const COURSES = [
    { id: 'MTH-SS3', subjectId: 1, code: 'MTH 301', title: 'Further Mathematics', form: 'SS 3', section: 'A',
      teacherId: 'SLGS-T001', teacherName: 'Mr. David Conteh', credits: 4, color: '#1a4731',
      description: 'Advanced calculus, statistics, mechanics and further pure mathematics in preparation for WASSCE.',
      schedule: [{ day: 'Monday', time: '08:00 – 09:40' }, { day: 'Wednesday', time: '10:00 – 11:40' }, { day: 'Friday', time: '08:00 – 09:00' }],
    },
    { id: 'ENG-SS3', subjectId: 2, code: 'ENG 301', title: 'English Language', form: 'SS 3', section: 'A',
      teacherId: 'SLGS-T002', teacherName: 'Mrs. Isatu Kamara', credits: 4, color: '#7c3aed',
      description: 'Comprehension, essay writing, summary and advanced grammar for WASSCE.',
      schedule: [{ day: 'Tuesday', time: '08:00 – 09:40' }, { day: 'Thursday', time: '10:00 – 11:00' }],
    },
    { id: 'MTH-SS2', subjectId: 1, code: 'MTH 201', title: 'Mathematics', form: 'SS 2', section: 'B',
      teacherId: 'SLGS-T001', teacherName: 'Mr. David Conteh', credits: 4, color: '#1a4731',
      description: 'Algebra, geometry, trigonometry and data handling.',
      schedule: [{ day: 'Monday', time: '10:00 – 11:40' }, { day: 'Thursday', time: '08:00 – 09:00' }],
    },
    { id: 'ENG-SS2', subjectId: 2, code: 'ENG 201', title: 'English Language', form: 'SS 2', section: 'B',
      teacherId: 'SLGS-T002', teacherName: 'Mrs. Isatu Kamara', credits: 4, color: '#7c3aed',
      description: 'Reading, writing and grammar for SS 2 students.',
      schedule: [{ day: 'Wednesday', time: '08:00 – 09:40' }, { day: 'Friday', time: '10:00 – 11:00' }],
    },
];

// ── Modules (per course) ──────────────────────────────────────
export const MODULES = [
    // MTH-SS3
    { id: 'm1', courseId: 'MTH-SS3', order: 1, title: 'Differentiation & Integration',
      published: true,
      items: [
          { id: 'mi1', type: 'video',  title: 'Intro to Differentiation',   url: 'https://www.youtube.com/embed/rAof9Ld5sOg', duration: '18 min', published: true },
          { id: 'mi2', type: 'link',   title: 'Khan Academy — Calculus',    url: 'https://www.khanacademy.org/math/calculus-1', published: true },
          { id: 'mi3', type: 'file',   title: 'Week 1 Notes (PDF)',         url: '#', size: '1.2 MB', published: true },
          { id: 'mi4', type: 'assignment', title: 'Problem Set 1 — Limits', dueDate: '2026-04-15', points: 20, published: true },
      ],
    },
    { id: 'm2', courseId: 'MTH-SS3', order: 2, title: 'Statistics & Probability',
      published: true,
      items: [
          { id: 'mi5', type: 'video',  title: 'Probability Distributions',  url: 'https://www.youtube.com/embed/6v7GhZCd1ko', duration: '22 min', published: true },
          { id: 'mi6', type: 'file',   title: 'Statistics Reference Sheet', url: '#', size: '480 KB', published: true },
          { id: 'mi7', type: 'assignment', title: 'Statistics Assignment 1', dueDate: '2026-04-22', points: 30, published: true },
          { id: 'mi8', type: 'exam',   title: 'Mid-Term Exam (Stats)',      dueDate: '2026-05-02', points: 100, published: true },
      ],
    },
    { id: 'm3', courseId: 'MTH-SS3', order: 3, title: 'Mechanics',
      published: false,
      items: [
          { id: 'mi9',  type: 'video', title: 'Newton\'s Laws Recap',       url: 'https://www.youtube.com/embed/_LdTPuRz3v4', duration: '14 min', published: false },
          { id: 'mi10', type: 'file',  title: 'Mechanics Notes Ch.1',       url: '#', size: '890 KB', published: false },
      ],
    },

    // ENG-SS3
    { id: 'm4', courseId: 'ENG-SS3', order: 1, title: 'Comprehension Skills',
      published: true,
      items: [
          { id: 'mi11', type: 'link',  title: 'BBC Learning English',       url: 'https://www.bbc.co.uk/learningenglish', published: true },
          { id: 'mi12', type: 'file',  title: 'Comprehension Passages Pack', url: '#', size: '2.1 MB', published: true },
          { id: 'mi13', type: 'assignment', title: 'Comprehension Exercise 1', dueDate: '2026-04-18', points: 25, published: true },
      ],
    },
    { id: 'm5', courseId: 'ENG-SS3', order: 2, title: 'Essay Writing',
      published: true,
      items: [
          { id: 'mi14', type: 'video', title: 'Essay Structure Masterclass', url: 'https://www.youtube.com/embed/s-i-exQU4lE', duration: '27 min', published: true },
          { id: 'mi15', type: 'assignment', title: 'Argumentative Essay Draft', dueDate: '2026-04-25', points: 40, published: true },
          { id: 'mi16', type: 'exam',  title: 'Essay Mock Exam',            dueDate: '2026-05-05', points: 100, published: true },
      ],
    },

    // MTH-SS2
    { id: 'm6', courseId: 'MTH-SS2', order: 1, title: 'Algebra Fundamentals',
      published: true,
      items: [
          { id: 'mi17', type: 'video', title: 'Linear & Quadratic Equations', url: 'https://www.youtube.com/embed/l3XzepN03KQ', duration: '20 min', published: true },
          { id: 'mi18', type: 'assignment', title: 'Algebra Exercise A',      dueDate: '2026-04-16', points: 20, published: true },
      ],
    },

    // ENG-SS2
    { id: 'm7', courseId: 'ENG-SS2', order: 1, title: 'Reading & Vocabulary',
      published: true,
      items: [
          { id: 'mi19', type: 'link',  title: 'Oxford Learner\'s Dictionary', url: 'https://www.oxfordlearnersdictionaries.com', published: true },
          { id: 'mi20', type: 'assignment', title: 'Vocabulary Quiz 1',       dueDate: '2026-04-17', points: 15, published: true },
      ],
    },
];

// ── Course Announcements ──────────────────────────────────────
export const COURSE_ANNOUNCEMENTS = [
    { id: 'ca1', courseId: 'MTH-SS3', authorId: 'SLGS-T001', author: 'Mr. David Conteh',
      title: 'Problem Set 1 Released',
      body: 'Problem Set 1 on Limits and Differentiation is now available under Module 1. Please submit by 15 April. Any questions, bring them to Wednesday\'s class.',
      date: '2026-04-05', pinned: true },
    { id: 'ca2', courseId: 'MTH-SS3', authorId: 'SLGS-T001', author: 'Mr. David Conteh',
      title: 'Mid-Term Exam — Syllabus & Format',
      body: 'The mid-term will cover Modules 1 and 2 (Differentiation, Integration, Statistics). It will be 2 hours long, closed-book, worth 100 marks. Bring scientific calculators. No phones.',
      date: '2026-04-03', pinned: false },
    { id: 'ca3', courseId: 'ENG-SS3', authorId: 'SLGS-T002', author: 'Mrs. Isatu Kamara',
      title: 'Welcome to English Language SS3',
      body: 'Welcome back, SS3A! This term we focus on comprehension and essay technique for WASSCE. Please ensure you have the prescribed text "Things Fall Apart" by next week.',
      date: '2026-03-31', pinned: true },
    { id: 'ca4', courseId: 'ENG-SS3', authorId: 'SLGS-T002', author: 'Mrs. Isatu Kamara',
      title: 'Essay Draft Submission Reminder',
      body: 'Your argumentative essay draft is due 25 April. Submit in class or email to i.kamara@slgs.edu.sl. Late submissions will be penalised 5 marks per day.',
      date: '2026-04-06', pinned: false },
    { id: 'ca5', courseId: 'MTH-SS2', authorId: 'SLGS-T001', author: 'Mr. David Conteh',
      title: 'Algebra Exercise A Posted',
      body: 'Algebra Exercise A is now live. Focus on solving quadratic equations using the formula method. Due 16 April.',
      date: '2026-04-04', pinned: false },
];

// ── Assignment Submissions ────────────────────────────────────
export const SUBMISSIONS = [
    { id: 'sub1', itemId: 'mi4', courseId: 'MTH-SS3', studentId: 'SLGS-240101',
      studentName: 'James Koroma', submittedAt: '2026-04-12 14:32', status: 'submitted',
      grade: null, feedback: '', filePath: 'problem_set_1_james.pdf', textContent: '' },
    { id: 'sub2', itemId: 'mi13', courseId: 'ENG-SS3', studentId: 'SLGS-240101',
      studentName: 'James Koroma', submittedAt: '2026-04-16 09:10', status: 'graded',
      grade: 21, feedback: 'Good work on inference questions. Work on conciseness in Q5.', filePath: '',
      textContent: 'Logistic regression is a supervised learning method that models the probability of a binary outcome using the sigmoid function. Unlike linear regression, it predicts class labels (0 or 1) rather than continuous values. The sigmoid function maps any input to a value between 0 and 1, which is interpreted as a probability. If the probability exceeds 0.5, the model predicts class 1; otherwise class 0. Logistic regression assumes a linear relationship between features and the log-odds of the outcome.' },
    { id: 'sub3', itemId: 'mi18', courseId: 'MTH-SS2', studentId: 'SLGS-240102',
      studentName: 'Aminata Sesay', submittedAt: '2026-04-14 16:00', status: 'graded',
      grade: 18, feedback: 'Excellent — full marks on factoring problems.', filePath: '',
      textContent: 'Question 1: x² - 5x + 6 = 0 → (x-2)(x-3) = 0 → x = 2 or x = 3\nQuestion 2: 2x² + 7x + 3 = 0 → (2x+1)(x+3) = 0 → x = -1/2 or x = -3\nQuestion 3: x² - 9 = 0 → (x-3)(x+3) = 0 → x = 3 or x = -3' },
];

// ── Course Discussions ────────────────────────────────────────
export const DISCUSSIONS = [
    { id: 'disc1', courseId: 'MTH-SS3', teacherId: 'SLGS-T001',
      title: 'Module 1 Discussion — Real-World Calculus',
      prompt: 'Each student will make at least one original post by Apr 9th.\nRespond to at least one of their peers by Apr 10th.\n\nTopics: Applications of Differentiation & Integration in everyday life.',
      openDate: '2026-04-06', dueDate: '2026-04-10', published: true,
      replies: [
          { id: 'r1', author: 'James Koroma', authorId: 'SLGS-240101', role: 'student',
            avatar: 'JK', date: 'Apr 7 9:18am',
            body: 'Calculus is widely used in engineering and physics. Differentiation helps us find the rate at which quantities change — for example, the velocity of a car is the derivative of its position with respect to time. When a car accelerates, we are looking at the second derivative. Integration is used to find total quantities: the area under a speed-time graph gives the total distance travelled.\n\nIn medicine, calculus is used to model how drugs dissolve in the bloodstream over time. The rate of decrease follows an exponential decay function, and integration tells doctors the total amount absorbed. Understanding these real-world connections makes calculus feel far more meaningful than abstract formulas.',
            replies: [
                { id: 'rr1', author: 'Miranda Gomes', authorId: 'SLGS-240103', role: 'student',
                  avatar: 'MG', date: 'Apr 7 11:20am',
                  body: 'Great point about medicine, James. I had not thought about drug absorption before. I would add that in economics, differentiation is used to find marginal cost and marginal revenue — the rate of change of cost or revenue with respect to quantity produced. This helps businesses decide the optimal level of production.' },
            ],
          },
          { id: 'r2', author: 'Aminata Sesay', authorId: 'SLGS-240102', role: 'student',
            avatar: 'AS', date: 'Apr 7 10:45am',
            body: 'Integration is used in architecture and construction. When engineers design a curved bridge or dome, they use integration to calculate the exact volume of material needed. Without it, they would have to approximate using rough shapes, which leads to wasted material or structural weakness. I think this shows that mathematics is not just theoretical — it literally holds buildings together.',
            replies: [],
          },
          { id: 'r3', author: 'Mr. David Conteh', authorId: 'SLGS-T001', role: 'teacher',
            avatar: 'DC', date: 'Apr 7 2:00pm',
            body: 'Excellent contributions from both of you. James, your connection to pharmacokinetics is spot on — this is actually a topic in A-Level Further Mathematics applied modules. Aminata, structural engineering is a perfect example. For everyone else: try to think about applications in agriculture, climate science, or economics. Remember, original posts are due tomorrow!',
            replies: [],
          },
      ],
    },
    { id: 'disc2', courseId: 'MTH-SS3', teacherId: 'SLGS-T001',
      title: 'Stats Discussion — Probability in Daily Life',
      prompt: 'Original post by Apr 16th. Reply to at least one peer by Apr 17th.\nTopic: Where do you see probability and statistics used in Sierra Leone or West Africa?',
      openDate: '2026-04-13', dueDate: '2026-04-17', published: true,
      replies: [],
    },
    { id: 'disc3', courseId: 'ENG-SS3', teacherId: 'SLGS-T002',
      title: 'Essay Workshop Discussion',
      prompt: 'Post one paragraph from your draft argumentative essay by Apr 22nd.\nGive constructive feedback to at least two peers by Apr 24th.\n\nFocus on: thesis clarity, evidence quality, and paragraph structure.',
      openDate: '2026-04-20', dueDate: '2026-04-24', published: true,
      replies: [],
    },
];

// ── Assignment / Exam Details (descriptions, instructions) ────
export const ASSIGNMENT_DETAILS = {
    'mi4': {
        description: 'Complete the following problems on limits and differentiation. Show all working clearly. Unsupported answers will not receive full marks.',
        instructions: [
            'Evaluate the limit: lim(x→2) (x² - 4) / (x - 2)',
            'Find dy/dx for: y = 3x⁴ - 5x² + 7x - 2',
            'Find the gradient of y = x³ at x = 2',
            'A particle moves such that s = t³ - 6t² + 9t. Find its velocity and acceleration at t = 3.',
            'Use the chain rule to differentiate: y = (2x³ + 1)⁵',
        ],
        allowText: true,
        allowFile: true,
        attachments: [],
    },
    'mi7': {
        description: 'This assignment covers probability distributions covered in Module 2. Answer all five questions. Calculators are permitted.',
        instructions: [
            'A bag contains 5 red and 3 blue balls. Two balls are drawn without replacement. Find P(both red).',
            'X follows a normal distribution with μ = 70 and σ = 10. Find P(X > 85).',
            'The probability of rain on any day is 0.3. Find P(exactly 3 rainy days in a week).',
            'Calculate the mean and variance of the distribution: X = 1(p=0.2), 2(p=0.3), 3(p=0.5).',
            'Sketch a binomial distribution for n = 6, p = 0.4 and describe its shape.',
        ],
        allowText: true,
        allowFile: true,
        attachments: [],
    },
    'mi8': {
        description: 'Mid-Term Examination covering Modules 1 and 2 (Differentiation, Integration, Statistics). Duration: 2 hours. Closed-book. Scientific calculators permitted. No phones.',
        instructions: [
            'Section A — Short Answer (40 marks): Answer ALL questions.',
            'Section B — Structured Questions (60 marks): Answer ANY THREE of five questions.',
            'All working must be clearly shown. State any theorems or rules used.',
            'Write your Name and Student ID on the answer booklet.',
        ],
        allowText: false,
        allowFile: true,
        attachments: [],
    },
    'mi13': {
        description: 'Read the passage provided below and answer all comprehension questions in full sentences. Answers must reflect close reading of the text.',
        instructions: [
            'Read the passage titled "The Niger Delta and Environmental Justice" carefully.',
            'Q1 (5 marks): In your own words, explain why the author describes the situation as "an ecological emergency".',
            'Q2 (5 marks): What techniques does the writer use to appeal to the reader\'s emotions? Give two examples.',
            'Q3 (8 marks): Summarise the passage in no more than 80 words.',
            'Q4 (7 marks): What is the writer\'s attitude towards multinational oil companies? How is it conveyed?',
        ],
        passage: 'The Niger Delta, once a pristine mosaic of rainforest and mangrove swamp, has become in the last five decades a symbol of corporate extraction without conscience. Oil spills, gas flares, and pipeline ruptures have poisoned water tables, destroyed fishing livelihoods, and forced communities into cycles of poverty they did not choose...',
        allowText: true,
        allowFile: false,
        attachments: [],
    },
    'mi15': {
        description: 'Write a well-structured argumentative essay on ONE of the following prompts. Your draft should demonstrate a clear thesis, supporting evidence, and awareness of counterarguments. Minimum 500 words.',
        instructions: [
            'Option A: "Social media does more harm than good for young people in West Africa." Argue for or against.',
            'Option B: "Sierra Leone should prioritise technical and vocational education over university education." Argue for or against.',
            'Option C: "The English language is a tool of empowerment, not colonial oppression." Evaluate this claim.',
            'Structure: Introduction (thesis) → Body paragraphs (min. 3) → Counterargument + rebuttal → Conclusion.',
            'Submit your draft — this will be returned with comments before the final submission.',
        ],
        allowText: true,
        allowFile: true,
        attachments: [],
    },
    'mi16': {
        description: 'Mock Examination — English Language Paper 2: Essay Writing. Duration: 2.5 hours. Answer ONE question from each section.',
        instructions: [
            'Section A — Argumentative Essay (50 marks): Write 500–600 words.',
            'Section B — Descriptive / Narrative Essay (50 marks): Write 450–550 words.',
            'Plan your essays before writing. Mark your plan clearly in your answer booklet.',
            'Marks are awarded for: Content & Ideas (40%), Organisation (30%), Language & Accuracy (30%).',
        ],
        allowText: false,
        allowFile: true,
        attachments: [],
    },
    'mi18': {
        description: 'Solve the following algebra problems. Show all steps. Marks are awarded for method, not just the final answer.',
        instructions: [
            'Solve by factoring: x² - 5x + 6 = 0',
            'Solve using the quadratic formula: 2x² + 7x + 3 = 0',
            'Solve by difference of two squares: x² - 9 = 0',
            'Expand and simplify: (x + 3)(x - 2) + (x + 1)²',
            'If f(x) = x² - 4x + 3, find f(2) and the roots of f(x) = 0.',
        ],
        allowText: true,
        allowFile: true,
        attachments: [],
    },
    'mi20': {
        description: 'Complete the vocabulary exercises below. Choose the best word from the box to fill each gap. Then write an original sentence using each word.',
        instructions: [
            'Word Bank: eloquent, ambiguous, perseverance, meticulous, candid, diligent, coherent, empathy',
            'Part A: Fill in the gaps (8 questions, 1 mark each)',
            'Part B: Write one original sentence for each word in the word bank (8 × 2 marks)',
            'Refer to a dictionary if needed, but the sentences must be your own.',
        ],
        allowText: true,
        allowFile: false,
        attachments: [],
    },
};
