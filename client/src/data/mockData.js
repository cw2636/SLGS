// ============================================================
// SLGS Mock Data — all in-memory data for the demo portal
// ============================================================

// ── Users ────────────────────────────────────────────────────
export const USERS = [
    // Students
    { id: 1, role: 'student', username: 'james.koroma', password: 'student123',
      name: 'James Koroma', email: 'james.koroma@slgs.edu.sl',
      studentId: 'SLGS-240101', form: 'SS 3', house: 'Johnson', dob: '2008-05-14',
      phone: '+232 76 111 222', guardian: 'Mr. Abu Koroma', address: '12 Wilberforce St, Freetown' },
    { id: 2, role: 'student', username: 'aminata.sesay', password: 'student123',
      name: 'Aminata Sesay', email: 'aminata.sesay@slgs.edu.sl',
      studentId: 'SLGS-240102', form: 'SS 2', house: 'Palmer', dob: '2009-02-22',
      phone: '+232 77 333 444', guardian: 'Mrs. Fatima Sesay', address: '5 Pademba Rd, Freetown' },

    // Teachers
    { id: 10, role: 'teacher', username: 'mr.conteh', password: 'teacher123',
      name: 'Mr. David Conteh', email: 'd.conteh@slgs.edu.sl',
      staffId: 'SLGS-T001', subject: 'Mathematics', qualification: 'B.Sc. (Fourah Bay)', experienceYears: 12 },
    { id: 11, role: 'teacher', username: 'mrs.kamara', password: 'teacher123',
      name: 'Mrs. Isatu Kamara', email: 'i.kamara@slgs.edu.sl',
      staffId: 'SLGS-T002', subject: 'English Language', qualification: 'M.A. English (USL)', experienceYears: 9 },

    // Academic Staff (Secretaries / Registrar)
    { id: 30, role: 'staff', username: 'ms.johnson', password: 'staff123',
      name: 'Ms. Patricia Johnson', email: 'p.johnson@slgs.edu.sl',
      staffId: 'SLGS-S001', department: 'Academic Registrar', title: 'Head of Records & Admissions' },
    { id: 31, role: 'staff', username: 'mr.bangura', password: 'staff123',
      name: 'Mr. Samuel Bangura', email: 's.bangura@slgs.edu.sl',
      staffId: 'SLGS-S002', department: 'Admissions Office', title: 'Admissions Secretary' },

    // Principal
    { id: 20, role: 'principal', username: 'principal', password: 'principal123',
      name: 'Rev. Kenneth Davies', email: 'principal@slgs.edu.sl',
      title: 'School Principal', since: 2018 },
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
      link: 'https://meet.google.com/xyz-abc-123', attendees: ['SS 3 Mathematics Students'], host: 'Mr. David Conteh', status: 'upcoming' },
    { id: 2, title: 'Parent-Teacher Consultation', date: '2026-04-15', time: '14:00', duration: '30 min',
      link: 'https://zoom.us/j/1234567890', attendees: ['SS 3 Parents'], host: 'Mr. David Conteh', status: 'upcoming' },
    { id: 3, title: 'End-of-Term Review', date: '2026-03-28', time: '11:00', duration: '45 min',
      link: 'https://meet.google.com/end-review', attendees: ['All SS 3 Students'], host: 'Mr. David Conteh', status: 'completed' },
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

// ── Principal Stats ───────────────────────────────────────────
export const SCHOOL_STATS = {
    totalStudents:  1240,
    totalTeachers:  68,
    totalStaff:     95,
    classrooms:     34,
    formsOffered:   ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'],
    passRate:       92.4,
    scholarships:   18,
    currentTerm:    'Term 2, 2025/2026',
};

// ── News items ────────────────────────────────────────────────
export const NEWS = [
    { id: 1, title: 'SLGS Tops National WASSCE Results', date: 'March 2026',
      summary: 'Sierra Leone Grammar School achieved the highest aggregate pass rate in the country for the 2025 WASSCE examinations, with 97% of students obtaining 5+ credits.',
      category: 'Achievement' },
    { id: 2, title: 'New Science Laboratory Inaugurated', date: 'February 2026',
      summary: 'The Bishop funded state-of-the-art science laboratory was officially opened by the Anglican Bishop of Freetown, significantly enhancing practical science education.',
      category: 'Facilities' },
    { id: 3, title: 'Model United Nations Delegation', date: 'January 2026',
      summary: 'Ten SLGS students represented Sierra Leone at the West African Model United Nations conference in Accra, Ghana, returning with two awards for Best Delegate.',
      category: 'Events' },
    { id: 4, title: '181st Founders\' Day Celebrated', date: 'March 2026',
      summary: 'The school marked 181 years of academic excellence with a special service at St. George\'s Cathedral, attended by alumni, staff, students and distinguished guests.',
      category: 'Events' },
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

