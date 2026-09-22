# -*- coding: utf-8 -*-
"""
GASC Idappadi - Smart Sports Management System
Complete Codebase Architecture, Module-by-Module Explanation, and Technical Documentation PDF Generator.
Written with ReportLab for high aesthetic quality, clean typography, tables, and structured layout.
"""

import sys
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Preformatted, Image
)
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber > 1:  # Skip on cover page
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0f4c81"))
            self.drawString(54, 800, "GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI")
            self.setFont("Helvetica-Oblique", 8)
            self.setFillColor(colors.HexColor("#555555"))
            self.drawRightString(541, 800, "Complete Source Code & Architecture Guide")
            
            # Top divider
            self.setStrokeColor(colors.HexColor("#0f4c81"))
            self.setLineWidth(0.75)
            self.line(54, 794, 541, 794)

            # Bottom divider
            self.setStrokeColor(colors.HexColor("#cccccc"))
            self.setLineWidth(0.5)
            self.line(54, 45, 541, 45)

            # Footer
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#666666"))
            self.drawString(54, 32, "GASC Sports Management System — Technical Manual")
            self.drawRightString(541, 32, f"Page {self._pageNumber} of {page_count}")
            self.restoreState()

def create_code_explanation_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f4c81")
    secondary_color = colors.HexColor("#1b75bc")
    dark_neutral = colors.HexColor("#222222")
    accent_green = colors.HexColor("#107c41")
    card_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=primary_color,
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#444444"),
        alignment=TA_CENTER
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'H3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=dark_neutral,
        spaceBefore=8,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=dark_neutral,
        alignment=TA_JUSTIFY,
        spaceAfter=5
    )

    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_block = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1e293b")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=dark_neutral
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold'
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f4c81")
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("GOVERNMENT ARTS AND SCIENCE COLLEGE", ParagraphStyle('InstHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=primary_color, alignment=TA_CENTER)))
    story.append(Paragraph("IDAPPADI - 637 102, SALEM DISTRICT, TAMIL NADU", ParagraphStyle('InstSub', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor("#555555"), alignment=TA_CENTER)))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE & PHYSICAL EDUCATION", ParagraphStyle('DeptSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=secondary_color, alignment=TA_CENTER)))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=5, spaceAfter=15))
    
    # Check if college logo exists
    logo_path = os.path.join(os.path.dirname(__file__), "client", "public", "images", "college-logo.png")
    if os.path.exists(logo_path):
        story.append(Image(logo_path, width=80, height=80))
        story.append(Spacer(1, 10))

    story.append(Paragraph("SMART SPORTS MANAGEMENT SYSTEM", title_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("COMPLETE SOURCE CODE ARCHITECTURE, FOLDER DIRECTORY & MODULE EXPLANATION GUIDE", subtitle_style))
    story.append(Spacer(1, 15))

    cover_box_data = [
        [Paragraph("<b>Project Specification & Code Blueprint Manual</b>", ParagraphStyle('CoverBoxH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, textColor=primary_color, alignment=TA_CENTER))],
        [Paragraph(
            "This technical documentation manual provides a comprehensive, file-by-file, module-by-module breakdown of the GASC Idappadi Smart Sports Management System. It explains the purpose of every folder, frontend UI/UX templates, JavaScript controllers, REST API routes, Express middleware, Supabase Cloud PostgreSQL schema, utility algorithms, security protocols, and operational workflows.",
            ParagraphStyle('CoverBoxB', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=dark_neutral, alignment=TA_JUSTIFY)
        )]
    ]
    cover_box = Table(cover_box_data, colWidths=[487])
    cover_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, primary_color),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 4),
    ]))
    story.append(cover_box)
    story.append(Spacer(1, 20))

    meta_table_data = [
        [Paragraph("<b>System Core</b>", table_cell_bold), Paragraph("Node.js (Express.js) + Modern Vanilla JS + CSS3 + Supabase", table_cell_style)],
        [Paragraph("<b>Database Engine</b>", table_cell_bold), Paragraph("Supabase PostgreSQL (Cloud Hosted, 16 Relational Tables, RLS, Triggers)", table_cell_style)],
        [Paragraph("<b>Target Institution</b>", table_cell_bold), Paragraph("Government Arts and Science College, Idappadi (GASC)", table_cell_style)],
        [Paragraph("<b>User Roles</b>", table_cell_bold), Paragraph("1. Physical Director / Admin &nbsp;&nbsp;|&nbsp;&nbsp; 2. Student Athletes &nbsp;&nbsp;|&nbsp;&nbsp; 3. Public", table_cell_style)],
        [Paragraph("<b>Document Version</b>", table_cell_bold), Paragraph("v2.5.0 Production Ready (Full Technical Reference)", table_cell_style)]
    ]
    meta_table = Table(meta_table_data, colWidths=[120, 367])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 25))
    story.append(Paragraph("<i>Prepared for Project Review, Viva-Voce Examination & Institutional Deployment</i>", ParagraphStyle('CoverFooter', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, textColor=colors.HexColor("#666666"), alignment=TA_CENTER)))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: SYSTEM OVERVIEW & ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("1. System Overview & Technology Stack", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "The <b>GASC Idappadi Smart Sports Management System</b> is a full-stack, enterprise-grade sports management platform designed specifically for Government Arts and Science College, Idappadi. The application automates student sports enrollment, master roster verification, biometric-ready daily attendance tracking, sports equipment inventory & fine calculations, inter-collegiate competition management, merit achievement awards, and AI-driven performance analytics.",
        body_style
    ))

    # Tech Stack Table
    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technologies Used", table_header_style), Paragraph("Key Role & Responsibility", table_header_style)],
        [
            Paragraph("<b>Frontend UI/UX</b>", table_cell_bold),
            Paragraph("HTML5, Vanilla CSS3 (Custom Responsive Design System), Modern Vanilla JavaScript (ES6+), FontAwesome Icons, Chart.js", table_cell_style),
            Paragraph("Responsive portal for Public, Admin Dashboard, and Student Athlete Portal without heavy third-party framework overhead.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend Server</b>", table_cell_bold),
            Paragraph("Node.js, Express.js REST APIs, CORS, Multer, Bcrypt.js, JSON Web Tokens (JWT), Nodemailer", table_cell_style),
            Paragraph("Handles authentication, business logic, file uploads, OTP generation/verification, email notifications, and automated report generation.", table_cell_style)
        ],
        [
            Paragraph("<b>Database & Cloud</b>", table_cell_bold),
            Paragraph("Supabase Cloud PostgreSQL (@supabase/supabase-js), SQL Views, Triggers, Functions, Foreign Key Cascades", table_cell_style),
            Paragraph("Cloud relational database managing 16 relational tables with ACID compliance, instant real-time data access, and automated seeders.", table_cell_style)
        ],
        [
            Paragraph("<b>AI & Analytics</b>", table_cell_bold),
            Paragraph("Heuristic AI Rule Engine (JS Service), Chart.js Data Visualizations", table_cell_style),
            Paragraph("Generates predictive sports performance insights, low-stock forecasts, attendance drop alerts, and department medal summaries.", table_cell_style)
        ]
    ]
    tech_table = Table(tech_data, colWidths=[90, 160, 237])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # Architecture Explanation
    story.append(Paragraph("High-Level Architectural Workflow", h2_style))
    story.append(Paragraph(
        "The system follows a standard <b>3-Tier MVC-style Architecture</b> (Client View &rarr; REST Controller/Service Layer &rarr; Supabase Database Layer):",
        body_style
    ))

    arch_steps = [
        "<b>1. Client Layer (Browser):</b> Public visitors access institutional news, achievements, and events. Students log into their dedicated Athlete Dashboard. Physical Directors manage complete institutional sports via the secured Admin Dashboard.",
        "<b>2. Application Gateway (Express.js):</b> Receives HTTP requests, validates JWT authorization tokens, sanitizes form inputs, checks role permissions (admin vs student), handles file multipart streams, and routes payloads to respective controllers.",
        "<b>3. Service & Utility Engines:</b> Performs OTP email dispatch (Nodemailer), AI performance scoring, inventory threshold calculations, and Excel roster parsing.",
        "<b>4. Supabase PostgreSQL Storage:</b> Executes relational queries, enforces foreign keys, updates stock quantities via atomic updates, and maintains permanent audit logs."
    ]
    for step in arch_steps:
        story.append(Paragraph(f"&bull; {step}", body_style))

    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 2: COMPLETE FOLDER DIRECTORY STRUCTURE
    # =========================================================================
    story.append(Paragraph("2. Complete Folder Directory Structure", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "The repository is organized into a clean, modular structure dividing client-side static assets and server-side business logic:",
        body_style
    ))

    dir_data = [
        [Paragraph("Path / Directory", table_header_style), Paragraph("Contents & Work Handled", table_header_style)],
        [Paragraph("<b>/</b> (Root)", table_cell_bold), Paragraph("Configuration files (<code>package.json</code>, <code>.env</code>), SQL schema (<code>supabase_schema.sql</code>), import scripts (<code>import-students.js</code>), and startup scripts (<code>start.bat</code>, <code>run.ps1</code>).", table_cell_style)],
        [Paragraph("<b>/client/public/</b>", table_cell_bold), Paragraph("Static frontend web application. Contains all HTML pages (Public, Student, Admin), CSS stylesheets, JavaScript files, college logos, images, and user upload directory.", table_cell_style)],
        [Paragraph("<b>/client/public/css/</b>", table_cell_bold), Paragraph("Contains <code>style.css</code> (Global design system, CSS variables, typography, responsive grids, dark/light cards, modal styles, and animations).", table_cell_style)],
        [Paragraph("<b>/client/public/js/</b>", table_cell_bold), Paragraph("Client-side controllers: <code>api.js</code> (Fetch wrapper), <code>auth.js</code> (Auth & OTP), <code>admin.js</code> (Admin Dashboard logic), <code>student.js</code> (Athlete portal), <code>public.js</code> (Website interactions), and <code>charts.js</code> (Analytics visualizers).", table_cell_style)],
        [Paragraph("<b>/client/public/uploads/</b>", table_cell_bold), Paragraph("Server upload destination for player profile avatars, competition posters, and achievement certificate attachments.", table_cell_style)],
        [Paragraph("<b>/server/</b>", table_cell_bold), Paragraph("Node.js Express backend root. Contains <code>server.js</code> (main entry point) and subdirectories for config, controllers, routes, middleware, models, services, and utils.", table_cell_style)],
        [Paragraph("<b>/server/config/</b>", table_cell_bold), Paragraph("Configuration modules: <code>supabase.js</code> (Supabase Cloud client connector) and <code>db.js</code> (Database status checker).", table_cell_style)],
        [Paragraph("<b>/server/controllers/</b>", table_cell_bold), Paragraph("15 Controller modules containing complete business logic for Authentication, Players, Sports, Equipment, Competitions, Teams, Achievements, Attendance, Practice, Roster, Analytics, etc.", table_cell_style)],
        [Paragraph("<b>/server/middleware/</b>", table_cell_bold), Paragraph("Express middlewares: <code>authMiddleware.js</code> (JWT verification, role authorization) and <code>uploadMiddleware.js</code> (Multer file storage and type filters).", table_cell_style)],
        [Paragraph("<b>/server/models/</b>", table_cell_bold), Paragraph("Schema reference definitions and ORM data structures for all 16 database entities.", table_cell_style)],
        [Paragraph("<b>/server/routes/</b>", table_cell_bold), Paragraph("16 Express router files mapping HTTP endpoints (GET, POST, PUT, DELETE) to corresponding controller handler functions.", table_cell_style)],
        [Paragraph("<b>/server/services/</b>", table_cell_bold), Paragraph("Specialized business services: <code>aiInsightsService.js</code>, <code>notificationService.js</code>, <code>stockService.js</code>, and <code>supabaseService.js</code>.", table_cell_style)],
        [Paragraph("<b>/server/utils/</b>", table_cell_bold), Paragraph("Utility modules: <code>emailService.js</code> (SMTP emails), <code>otpStore.js</code> (In-memory OTP storage), <code>seedSupabase.js</code> (Auto-seeder), <code>supabaseHelper.js</code>, and <code>supabaseSync.js</code>.", table_cell_style)]
    ]
    dir_table = Table(dir_data, colWidths=[130, 357])
    dir_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(dir_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: FRONTEND MODULES & CODE EXPLANATION
    # =========================================================================
    story.append(Paragraph("3. Frontend UI & JavaScript Modules", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("3.1 Frontend HTML Pages Breakdown", h2_style))
    story.append(Paragraph(
        "The frontend is built as a lightweight, lightning-fast Single/Multi-Page Application hybrid utilizing standard HTML5 and responsive modern styling:",
        body_style
    ))

    html_pages_data = [
        [Paragraph("HTML File", table_header_style), Paragraph("Target Users", table_header_style), Paragraph("Functionality & Code Features", table_header_style)],
        [
            Paragraph("<b>index.html</b>", table_cell_bold),
            Paragraph("Public, All Visitors", table_cell_style),
            Paragraph("College Sports Portal Landing Page. Displays college hero banner, Quick Statistics (Athletes, Sports, Medals), Upcoming Tournaments, Recent Achievements, Sports Offered showcase, Gallery preview, and Contact section.", table_cell_style)
        ],
        [
            Paragraph("<b>login.html</b>", table_cell_bold),
            Paragraph("Students & Admin", table_cell_style),
            Paragraph("Dual Login Portal. Supports Student Login (using College Register Number / Roll No + Password) and Admin / Physical Director login. Includes 'Forgot Password' OTP flow.", table_cell_style)
        ],
        [
            Paragraph("<b>register.html</b>", table_cell_bold),
            Paragraph("Enrolled Students", table_cell_style),
            Paragraph("Smart Student Athlete Registration. Enforces College Roster Verification (matches Register Number + DOB with college master records), sends Email OTP, and creates player account.", table_cell_style)
        ],
        [
            Paragraph("<b>admin-dashboard.html</b>", table_cell_bold),
            Paragraph("Physical Director / Admin", table_cell_style),
            Paragraph("Comprehensive Command Center. Contains 12 full management tabs: Live Analytics & AI Insights, Student Athletes, Sports Master, Equipment Inventory, Competitions, Teams, Achievements, Attendance Register, Practice Sessions, College Master Roster, Gallery, and System Settings.", table_cell_style)
        ],
        [
            Paragraph("<b>student-dashboard.html</b>", table_cell_bold),
            Paragraph("Logged-in Students", table_cell_style),
            Paragraph("Athlete Portal. Features Student Profile Card, Sports Enrolled, Daily Attendance History & Percentage, Equipment Borrowed & Return Status, Competition Registrations, and Achievement Submissions.", table_cell_style)
        ],
        [
            Paragraph("<b>achievements.html</b>", table_cell_bold),
            Paragraph("Public / Students", table_cell_style),
            Paragraph("Hall of Fame & Trophy Wall. Showcases Zonal, State, Inter-Collegiate, and National medals won by GASC athletes with filter by sport and year.", table_cell_style)
        ],
        [
            Paragraph("<b>competitions.html</b>", table_cell_bold),
            Paragraph("Public / Students", table_cell_style),
            Paragraph("College & University Fixtures. Lists Upcoming, Ongoing, and Completed tournaments, eligibility rules, venue details, and registration links.", table_cell_style)
        ],
        [
            Paragraph("<b>sports.html & gallery.html</b>", table_cell_bold),
            Paragraph("Public / Visitors", table_cell_style),
            Paragraph("Explores sports infrastructure (Athletics track, Volleyball court, Kabaddi ground, Indoor badminton/chess) and photo galleries.", table_cell_style)
        ],
        [
            Paragraph("<b>about.html & contact.html</b>", table_cell_bold),
            Paragraph("Public / Visitors", table_cell_style),
            Paragraph("Institutional profile, Physical Director message, college vision/mission, sports department contact details, and location map.", table_cell_style)
        ]
    ]
    html_table = Table(html_pages_data, colWidths=[110, 85, 292])
    html_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(html_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.2 Frontend JavaScript Architecture", h2_style))
    story.append(Paragraph(
        "The client-side logic is organized into specialized, modular JS files located in <code>client/public/js/</code>:",
        body_style
    ))

    js_modules_data = [
        [Paragraph("JavaScript File", table_header_style), Paragraph("Key Functions & Internal Logic", table_header_style)],
        [
            Paragraph("<b>api.js</b><br/>(API Gateway)", table_cell_bold),
            Paragraph("• <code>apiFetch(endpoint, options)</code>: Centralized HTTP wrapper that attaches JWT Bearer tokens to headers and standardizes error responses.<br/>• <code>uploadFile(endpoint, formData)</code>: Handles multipart form uploads for profile pictures, certificate proofs, and tournament posters.<br/>• <code>showToast(message, type)</code>: Displays animated success, warning, and error toast alerts.", table_cell_style)
        ],
        [
            Paragraph("<b>auth.js</b><br/>(Authentication)", table_cell_bold),
            Paragraph("• <code>login(credentials)</code>: Submits student/admin login and stores JWT token & user session in localStorage.<br/>• <code>verifyRosterAndSendOtp()</code>: Validates register number against college roster before triggering 6-digit email OTP.<br/>• <code>verifyOtpAndRegister()</code>: Confirms OTP and finalizes athlete profile creation.<br/>• <code>forgotPasswordFlow()</code> & <code>logout()</code>: Handles password recovery and secure session termination.", table_cell_style)
        ],
        [
            Paragraph("<b>admin.js</b><br/>(Admin Controller)", table_cell_bold),
            Paragraph("• <code>loadDashboardStats()</code>: Fetches counts, charts, and AI predictive insights.<br/>• <code>renderPlayers()</code> / <code>exportPlayersCSV()</code>: Manages athlete table, filters by sport/dept, and downloads data.<br/>• <code>manageEquipment()</code>: Handles stock addition, item issuance, return verification, damage logs, and fine assessments.<br/>• <code>markAttendance()</code>: Fast daily attendance grid for marking Present/Absent/OD.<br/>• <code>manageCompetitions()</code> & <code>manageRoster()</code>: CRUD for tournaments and Excel bulk student roster upload.", table_cell_style)
        ],
        [
            Paragraph("<b>student.js</b><br/>(Student Portal)", table_cell_bold),
            Paragraph("• <code>loadStudentProfile()</code>: Fetches athlete metrics (height, weight, blood group, department, batch).<br/>• <code>renderMyAttendance()</code>: Visualizes attendance percentage bar and OD session history.<br/>• <code>renderMyEquipment()</code>: Lists active borrowed gear with return due dates.<br/>• <code>registerForEvent()</code>: One-click tournament registration.", table_cell_style)
        ],
        [
            Paragraph("<b>charts.js</b><br/>(Visualizer)", table_cell_bold),
            Paragraph("• <code>initGenderChart()</code>: Renders Doughnut chart of Male vs Female athlete participation.<br/>• <code>initDepartmentChart()</code>: Renders Bar chart of athletes across CS, Maths, Physics, Chemistry, English, Tamil, B.Com.<br/>• <code>initMonthlyAttendanceChart()</code>: Renders Line trend of daily training attendance.", table_cell_style)
        ]
    ]
    js_table = Table(js_modules_data, colWidths=[120, 367])
    js_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(js_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: BACKEND CONTROLLERS & ROUTES EXPLANATION
    # =========================================================================
    story.append(Paragraph("4. Backend Server, Controllers & Routes", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "The backend server is powered by Express.js and structured into RESTful route handlers and modular controller functions:",
        body_style
    ))

    controllers_data = [
        [Paragraph("Controller / Route", table_header_style), Paragraph("HTTP Endpoints", table_header_style), Paragraph("Business Logic & Code Execution", table_header_style)],
        [
            Paragraph("<b>authController.js</b><br/><code>/api/auth</code>", table_cell_bold),
            Paragraph("POST /login<br/>POST /register<br/>POST /send-otp<br/>POST /verify-otp<br/>POST /reset-password", table_cell_style),
            Paragraph("• Verifies student credentials and admin passwords using <code>bcrypt.compare</code>.<br/>• Cross-checks student register numbers against <code>college_student_roster</code>.<br/>• Generates cryptographically secure 6-digit OTPs and delivers via Nodemailer.<br/>• Issues signed JSON Web Tokens (JWT) with 7-day expiration.", table_cell_style)
        ],
        [
            Paragraph("<b>playerController.js</b><br/><code>/api/players</code>", table_cell_bold),
            Paragraph("GET /<br/>GET /profile<br/>PUT /profile<br/>GET /:id", table_cell_style),
            Paragraph("• Retrieves athlete profile, sports history, and biometric stats.<br/>• Handles avatar image upload via Multer and updates Supabase player record.<br/>• Provides admin-level filtering by sport, department, batch, and gender.", table_cell_style)
        ],
        [
            Paragraph("<b>equipmentController.js</b><br/><code>/api/equipment</code>", table_cell_bold),
            Paragraph("GET /<br/>POST /<br/>POST /issue<br/>POST /return<br/>GET /transactions", table_cell_style),
            Paragraph("• Manages sports inventory items (Cricket bats, Volleyballs, Nets, Javelins).<br/>• Atomically decrements available stock upon gear issue.<br/>• Computes overdue late fines and damage charges on return, automatically incrementing available stock.", table_cell_style)
        ],
        [
            Paragraph("<b>competitionController.js</b><br/><code>/api/competitions</code>", table_cell_bold),
            Paragraph("GET /<br/>POST /<br/>POST /:id/register<br/>PUT /:id/results", table_cell_style),
            Paragraph("• Admin creates upcoming tournaments with entry deadlines, venue, and rules.<br/>• Students register solo or as team captains.<br/>• Admin updates winners, scores, and medal tallies.", table_cell_style)
        ],
        [
            Paragraph("<b>attendanceController.js</b><br/><code>/api/attendance</code>", table_cell_bold),
            Paragraph("POST /mark<br/>GET /daily<br/>GET /summary<br/>GET /student/:id", table_cell_style),
            Paragraph("• Bulk marks daily sports training attendance (Present / Absent / OD).<br/>• Computes per-student attendance percentage required for academic On-Duty (OD) exam exemptions.", table_cell_style)
        ],
        [
            Paragraph("<b>practiceController.js</b><br/><code>/api/practice</code>", table_cell_bold),
            Paragraph("GET /<br/>POST /<br/>PUT /:id<br/>DELETE /:id", table_cell_style),
            Paragraph("• Physical Director schedules daily coaching drills, practice matches, and fitness sessions with specific grounds and timing.", table_cell_style)
        ],
        [
            Paragraph("<b>achievementController.js</b><br/><code>/api/achievements</code>", table_cell_bold),
            Paragraph("GET /<br/>POST /<br/>PUT /:id/verify", table_cell_style),
            Paragraph("• Records medals, trophies, and merit certificates (Zonal, State, National).<br/>• Students submit achievement claims with certificate proof for admin verification.", table_cell_style)
        ],
        [
            Paragraph("<b>teamController.js & sportController.js</b>", table_cell_bold),
            Paragraph("GET / POST / PUT on <code>/api/teams</code> and <code>/api/sports</code>", table_cell_style),
            Paragraph("• Manages sports disciplines offered at GASC Idappadi.<br/>• Forms official college teams (Cricket, Volleyball, Kabaddi, Kho-Kho, Chess) and assigns captains.", table_cell_style)
        ],
        [
            Paragraph("<b>rosterController.js</b><br/><code>/api/roster</code>", table_cell_bold),
            Paragraph("GET /<br/>POST /upload-excel<br/>POST /verify", table_cell_style),
            Paragraph("• Handles institutional student roster validation.<br/>• Supports bulk import of entire college student data from Excel (<code>.xlsx</code>) files to eliminate outsider fake signups.", table_cell_style)
        ],
        [
            Paragraph("<b>analyticsController.js</b><br/><code>/api/analytics</code>", table_cell_bold),
            Paragraph("GET /dashboard<br/>GET /ai-insights", table_cell_style),
            Paragraph("• Aggregates total athletes, sport popularity, gender ratios, and inventory usage.<br/>• Calls <code>aiInsightsService.js</code> to generate heuristic recommendations.", table_cell_style)
        ]
    ]
    controllers_table = Table(controllers_data, colWidths=[110, 110, 267])
    controllers_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(controllers_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: MIDDLEWARE, SERVICES & UTILITIES
    # =========================================================================
    story.append(Paragraph("5. Server Middleware, Services & Utilities", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("5.1 Express Middlewares", h2_style))
    
    mw_data = [
        [Paragraph("Middleware File", table_header_style), Paragraph("Function Name", table_header_style), Paragraph("Detailed Role & Security Operations", table_header_style)],
        [
            Paragraph("<b>authMiddleware.js</b>", table_cell_bold),
            Paragraph("<code>authenticateJWT</code>", table_cell_style),
            Paragraph("Extracts the Bearer token from the HTTP <code>Authorization</code> header, verifies its digital signature using <code>JWT_SECRET</code>, and attaches the decoded user payload (<code>req.user</code>) to the request.", table_cell_style)
        ],
        [
            Paragraph("<b>authMiddleware.js</b>", table_cell_bold),
            Paragraph("<code>requireAdmin</code>", table_cell_style),
            Paragraph("Ensures that the authenticated user possesses the <code>admin</code> role. If a normal student attempts an administrative action, it returns HTTP 403 Forbidden.", table_cell_style)
        ],
        [
            Paragraph("<b>uploadMiddleware.js</b>", table_cell_bold),
            Paragraph("<code>upload</code> (Multer)", table_cell_style),
            Paragraph("Configures disk storage destination (<code>client/public/uploads/</code>), assigns unique timestamps to filenames, and enforces file type filtering (images: PNG, JPG, JPEG, WEBP; docs: PDF).", table_cell_style)
        ]
    ]
    mw_table = Table(mw_data, colWidths=[110, 95, 282])
    mw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(mw_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("5.2 Business Services & System Utilities", h2_style))
    
    services_data = [
        [Paragraph("Module / Script", table_header_style), Paragraph("Location", table_header_style), Paragraph("Purpose & Implementation Details", table_header_style)],
        [
            Paragraph("<b>aiInsightsService.js</b>", table_cell_bold),
            Paragraph("<code>server/services/</code>", table_cell_style),
            Paragraph("<b>AI Heuristic Engine:</b> Analyzes athlete attendance trends (flags &lt;75% attendance), forecasts inventory restock needs (low stock alerts), identifies top-performing college sports departments, and recommends training regimens.", table_cell_style)
        ],
        [
            Paragraph("<b>emailService.js</b>", table_cell_bold),
            Paragraph("<code>server/utils/</code>", table_cell_style),
            Paragraph("<b>Nodemailer Dispatcher:</b> Sends beautiful HTML emails for Registration OTP verification, Password resets, Tournament confirmation alerts, and Equipment overdue notices via SMTP.", table_cell_style)
        ],
        [
            Paragraph("<b>otpStore.js</b>", table_cell_bold),
            Paragraph("<code>server/utils/</code>", table_cell_style),
            Paragraph("<b>In-Memory OTP Cache:</b> Stores ephemeral 6-digit registration & password-reset verification tokens with strict 10-minute expiration windows and automatic cleanup.", table_cell_style)
        ],
        [
            Paragraph("<b>seedSupabase.js</b>", table_cell_bold),
            Paragraph("<code>server/utils/</code>", table_cell_style),
            Paragraph("<b>Automated Database Seeder:</b> Automatically populates Supabase PostgreSQL with default Admin accounts, sample student roster, standard sports (Cricket, Volleyball, Kabaddi), initial equipment stock, and sample competitions.", table_cell_style)
        ],
        [
            Paragraph("<b>supabase.js</b>", table_cell_bold),
            Paragraph("<code>server/config/</code>", table_cell_style),
            Paragraph("<b>Supabase Client Connector:</b> Initializes the <code>@supabase/supabase-js</code> client using <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> from <code>.env</code>.", table_cell_style)
        ]
    ]
    services_table = Table(services_data, colWidths=[110, 85, 292])
    services_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(services_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: DATABASE SCHEMA & SUPABASE POSTGRESQL TABLES
    # =========================================================================
    story.append(Paragraph("6. Database Architecture & Supabase Schema", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "The system utilizes <b>Supabase Cloud PostgreSQL</b> as its relational database. The schema is fully normalized and consists of <b>16 core tables</b> linked through foreign key constraints:",
        body_style
    ))

    db_tables_data = [
        [Paragraph("Table Name", table_header_style), Paragraph("Primary Key / Foreign Keys", table_header_style), Paragraph("Stored Information & Columns", table_header_style)],
        [
            Paragraph("<b>users</b>", table_cell_bold),
            Paragraph("<code>id</code> (UUID / Serial)<br/>Unique: <code>register_number</code>, <code>email</code>", table_cell_style),
            Paragraph("User authentication records: register_number, email, password_hash (bcrypt), role ('admin' / 'student'), full_name, is_active, created_at.", table_cell_style)
        ],
        [
            Paragraph("<b>college_student_roster</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>Unique: <code>register_number</code>", table_cell_style),
            Paragraph("Master college registry: register_number, roll_no, full_name, department, batch_year, gender, date_of_birth, mobile, email, is_registered.", table_cell_style)
        ],
        [
            Paragraph("<b>player_profiles</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>user_id</code> &rarr; users(id)", table_cell_style),
            Paragraph("Athlete biometrics: height_cm, weight_kg, blood_group, emergency_contact, primary_sport_id, secondary_sport_id, t_shirt_size, avatar_url.", table_cell_style)
        ],
        [
            Paragraph("<b>sports</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>Unique: <code>code</code>", table_cell_style),
            Paragraph("Sports master: name ('Cricket', 'Volleyball', etc.), code, category ('Indoor' / 'Outdoor' / 'Track'), team_size, rules_description, icon.", table_cell_style)
        ],
        [
            Paragraph("<b>equipment</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>sport_id</code> &rarr; sports(id)", table_cell_style),
            Paragraph("Sports inventory: item_name, sport_id, total_quantity, available_quantity, damaged_quantity, low_stock_threshold, storage_room, unit_price.", table_cell_style)
        ],
        [
            Paragraph("<b>equipment_transactions</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>equipment_id</code>, <code>student_id</code>", table_cell_style),
            Paragraph("Issue/Return logs: equipment_id, student_id, quantity, issued_date, expected_return_date, actual_return_date, status ('Issued' / 'Returned' / 'Overdue'), condition, fine_amount.", table_cell_style)
        ],
        [
            Paragraph("<b>competitions</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>sport_id</code> &rarr; sports(id)", table_cell_style),
            Paragraph("Tournaments: title, sport_id, level ('Zonal' / 'Inter-Collegiate' / 'State' / 'National'), start_date, end_date, venue, registration_deadline, max_participants, status.", table_cell_style)
        ],
        [
            Paragraph("<b>competition_registrations</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>competition_id</code>, <code>student_id</code>", table_cell_style),
            Paragraph("Student registrations: competition_id, student_id, registration_type ('Solo' / 'Team'), team_name, status ('Pending' / 'Approved' / 'Rejected'), result_position.", table_cell_style)
        ],
        [
            Paragraph("<b>attendance</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>student_id</code>, <code>sport_id</code>", table_cell_style),
            Paragraph("Daily training attendance: student_id, sport_id, attendance_date, status ('Present' / 'Absent' / 'On-Duty'), marked_by, remarks.", table_cell_style)
        ],
        [
            Paragraph("<b>practice_sessions</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>sport_id</code> &rarr; sports(id)", table_cell_style),
            Paragraph("Coaching schedules: sport_id, session_title, session_date, start_time, end_time, venue_ground, coach_incharge, drill_focus.", table_cell_style)
        ],
        [
            Paragraph("<b>achievements</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>student_id</code>, <code>sport_id</code>", table_cell_style),
            Paragraph("Merit & Awards: student_id, sport_id, event_title, award_type ('Winner' / 'Runner' / 'Bronze'), medal ('Gold' / 'Silver' / 'Bronze'), certificate_url, verified_by_admin.", table_cell_style)
        ],
        [
            Paragraph("<b>teams & team_members</b>", table_cell_bold),
            Paragraph("<code>id</code><br/>FK: <code>sport_id</code>, <code>captain_id</code>", table_cell_style),
            Paragraph("College teams: team_name, sport_id, captain_id, academic_year, team members junction table.", table_cell_style)
        ],
        [
            Paragraph("<b>notifications & gallery</b>", table_cell_bold),
            Paragraph("<code>id</code>", table_cell_style),
            Paragraph("Broadcast notifications, target role/sport, is_read, gallery photo items with captions and categories.", table_cell_style)
        ],
        [
            Paragraph("<b>admin_settings & otps</b>", table_cell_bold),
            Paragraph("<code>id</code> / Key-Value", table_cell_style),
            Paragraph("Institution metadata, Physical Director name, current academic year, SMTP toggles, and OTP verification records.", table_cell_style)
        ]
    ]
    db_table = Table(db_tables_data, colWidths=[110, 110, 267])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(db_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: END-TO-END WORKFLOWS & DATA FLOW
    # =========================================================================
    story.append(Paragraph("7. End-to-End Operational Workflows & Data Flows", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("7.1 Student Onboarding & Verification Flow", h2_style))
    story.append(Paragraph(
        "To guarantee that only bona-fide GASC Idappadi students can register, the system implements a strict 3-step verification protocol:",
        body_style
    ))
    
    flow1 = [
        "<b>Step 1 (Roster Lookup):</b> The student enters Register Number and Date of Birth on <code>register.html</code>. The frontend queries <code>POST /api/auth/send-otp</code>. The server validates if the student exists in <code>college_student_roster</code> and is not yet registered.",
        "<b>Step 2 (OTP Generation & Email):</b> The backend creates a cryptographically random 6-digit OTP, caches it in <code>otpStore.js</code> with a 10-minute TTL, and dispatches an HTML email to the student's official registered email address via Nodemailer.",
        "<b>Step 3 (Account Creation):</b> The student inputs the received OTP and creates a secure password. The server verifies the OTP, hashes the password using <code>bcrypt.hash(password, 10)</code>, creates a row in <code>users</code>, initializes a <code>player_profiles</code> record, marks <code>is_registered = true</code> in the roster, and signs a JWT."
    ]
    for f in flow1:
        story.append(Paragraph(f"&bull; {f}", body_style))
    
    story.append(Spacer(1, 10))

    story.append(Paragraph("7.2 Sports Equipment Issue & Return Lifecycle", h2_style))
    flow2 = [
        "<b>Step 1 (Issuance):</b> The Physical Director selects an item (e.g. Volleyball Net) and inputs the Student's Register Number on <code>admin-dashboard.html</code>.",
        "<b>Step 2 (Stock Deduction):</b> <code>POST /api/equipment/issue</code> creates an <code>equipment_transactions</code> record and decrements <code>available_quantity</code> in the <code>equipment</code> table by 1.",
        "<b>Step 3 (Return & Condition Check):</b> When returning gear, the admin marks condition ('Good' / 'Damaged'). If returned after <code>expected_return_date</code>, an automated late fine is calculated. Stock is incremented back, or moved to <code>damaged_quantity</code>."
    ]
    for f in flow2:
        story.append(Paragraph(f"&bull; {f}", body_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("7.3 Attendance Tracking & Academic On-Duty (OD) Flow", h2_style))
    flow3 = [
        "<b>Step 1 (Marking):</b> Admin opens the Daily Attendance tab, selects the Sport (e.g. Kabaddi), and fast-marks Present / Absent / On-Duty.",
        "<b>Step 2 (Aggregation):</b> The backend stores records in <code>attendance</code>. The system aggregates cumulative attendance percentages per athlete.",
        "<b>Step 3 (Exemption Report):</b> If an athlete has &gt;75% sports training attendance and participates in university zonals, the admin generates an official On-Duty (OD) exemption PDF report for semester exam eligibility."
    ]
    for f in flow3:
        story.append(Paragraph(f"&bull; {f}", body_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 8: SECURITY, VIVA PREPARATION & HOW TO RUN
    # =========================================================================
    story.append(Paragraph("8. Security Architecture & Viva-Voce Key Points", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("8.1 Security & Best Practices", h2_style))
    sec_points = [
        "<b>Password Hashing:</b> Passwords are never stored in plain text; salted SHA-256 bcrypt hashing with 10 salt rounds is applied.",
        "<b>Stateless JWT Authentication:</b> Tokens are cryptographically signed using HS256 algorithm and validated on every protected API endpoint.",
        "<b>Role-Based Access Control (RBAC):</b> Strict separation of student vs admin capabilities via <code>requireAdmin</code> middleware.",
        "<b>SQL Injection & XSS Protection:</b> Parameterized Supabase client queries prevent SQL injection, and all frontend DOM updates sanitize dynamic user strings."
    ]
    for p in sec_points:
        story.append(Paragraph(f"&bull; {p}", body_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("8.2 Frequently Asked Viva-Voce Questions & Answers", h2_style))
    
    viva_data = [
        [Paragraph("Viva Question", table_header_style), Paragraph("Recommended Technical Answer for Examiner", table_header_style)],
        [
            Paragraph("<b>Q1: Why did you choose Supabase PostgreSQL over MongoDB?</b>", table_cell_bold),
            Paragraph("Sports management data is highly relational (e.g., Students link to Profiles, Attendance, Equipment Loans, and Tournaments). PostgreSQL enforces ACID compliance, Foreign Key Cascades, and Referential Integrity, which prevents orphan loan records and inconsistent stock numbers.", table_cell_style)
        ],
        [
            Paragraph("<b>Q2: How does the system prevent fake student registrations?</b>", table_cell_bold),
            Paragraph("The college admin pre-loads the master student database via Excel. During registration, the student's Register Number and DOB are validated against the roster, followed by 6-digit OTP delivery to the registered email.", table_cell_style)
        ],
        [
            Paragraph("<b>Q3: What role does the AI Insights Service play?</b>", table_cell_bold),
            Paragraph("It utilizes heuristic statistical models to analyze attendance patterns, predict equipment shortages before major tournaments, and generate department-wise medal conversion metrics.", table_cell_style)
        ],
        [
            Paragraph("<b>Q4: How does the equipment stock remain synchronized?</b>", table_cell_bold),
            Paragraph("Every equipment transaction executes an atomic database operation: decrementing available stock on issue and incrementing upon verified return.", table_cell_style)
        ]
    ]
    viva_table = Table(viva_data, colWidths=[150, 337])
    viva_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story.append(viva_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("8.3 How to Run the Project Locally", h2_style))
    run_steps = [
        "<b>Step 1:</b> Open project directory in terminal or VS Code.",
        "<b>Step 2:</b> Install dependencies: <code>npm install</code>",
        "<b>Step 3:</b> Configure <code>.env</code> file with <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>.",
        "<b>Step 4:</b> Launch the application: <code>npm run dev</code> or run <code>start.bat</code>",
        "<b>Step 5:</b> Open your web browser at <b>http://localhost:5000</b>"
    ]
    for s in run_steps:
        story.append(Paragraph(f"&bull; {s}", body_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {output_filename}")

if __name__ == "__main__":
    out_pdf = os.path.join(os.path.dirname(__file__), "GASC_Sports_Complete_Code_Explanation_Guide.pdf")
    create_code_explanation_pdf(out_pdf)
    # Also copy to client/public so it's accessible via web server
    public_pdf = os.path.join(os.path.dirname(__file__), "client", "public", "GASC_Sports_Complete_Code_Explanation_Guide.pdf")
    try:
        import shutil
        shutil.copyfile(out_pdf, public_pdf)
        print(f"Copied to client public folder: {public_pdf}")
    except Exception as e:
        print(f"Note: {e}")
