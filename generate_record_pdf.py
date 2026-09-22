# -*- coding: utf-8 -*-
"""
GASC Idappadi - Smart Sports Management System
Comprehensive Project Record Report PDF Generator
Strictly adhering to the Table of Contents order from the user's provided specification.
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
        if self._pageNumber > 1:  # Skip header/footer on title cover page
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0f4c81"))
            self.drawString(54, 800, "GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI")
            self.setFont("Helvetica-Oblique", 8)
            self.setFillColor(colors.HexColor("#555555"))
            self.drawRightString(541, 800, "Smart Sports Management System")
            
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
            self.drawString(54, 32, "Department of Computer Science & Sports")
            self.drawRightString(541, 32, f"Page {self._pageNumber} of {page_count}")
            self.restoreState()


def build_pdf(filename="GASC_Idappadi_Sports_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    c_primary = colors.HexColor("#0f4c81")
    c_secondary = colors.HexColor("#1e3a8a")
    c_dark = colors.HexColor("#1e293b")
    c_accent = colors.HexColor("#05c46b")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=26,
        alignment=TA_CENTER,
        textColor=c_primary,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        alignment=TA_CENTER,
        textColor=c_secondary,
        spaceAfter=20
    )

    college_style = ParagraphStyle(
        'CoverCollege',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        alignment=TA_CENTER,
        textColor=c_dark,
        spaceAfter=8
    )

    dept_style = ParagraphStyle(
        'CoverDept',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#475569"),
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_secondary,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        alignment=TA_JUSTIFY,
        textColor=c_dark,
        spaceAfter=7
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        leftIndent=15,
        textColor=c_dark,
        spaceAfter=4
    )

    center_bold = ParagraphStyle(
        'CenterBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=c_dark,
        spaceAfter=10
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    def add_header(title):
        story.append(Paragraph(title, h1_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))

    def add_sub(title):
        story.append(Paragraph(title, h2_style))

    def add_sub3(title):
        story.append(Paragraph(title, h3_style))

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("A PROJECT WORK REPORT ON", ParagraphStyle('SubSub', fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#64748b"))))
    story.append(Spacer(1, 10))
    story.append(Paragraph("SMART SPORTS MANAGEMENT SYSTEM", title_style))
    story.append(Paragraph("A Full-Stack Collegiate Athletic Portal with Bonafide Roster Verification & Email OTP Authentication", subtitle_style))
    story.append(Spacer(1, 25))

    story.append(Paragraph("Submitted in partial fulfillment of the requirements for the award of the degree of", ParagraphStyle('AwardTxt', fontName='Helvetica', fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#475569"))))
    story.append(Paragraph("<b>BACHELOR OF SCIENCE IN COMPUTER SCIENCE</b>", center_bold))
    story.append(Spacer(1, 30))

    # Details Box Table
    info_data = [
        [Paragraph("<b>Submitted By:</b>", body_style), Paragraph("<b>Under the Guidance of:</b>", body_style)],
        [Paragraph("<b>STUDENT NAME:</b> [Candidate Name]<br/><b>REGISTER NUMBER:</b> [Register Number]<br/><b>DEPARTMENT:</b> Computer Science", body_style),
         Paragraph("<b>FACULTY GUIDE:</b> [Guide Name, M.Sc., M.Phil.]<br/><b>DESIGNATION:</b> Assistant Professor<br/><b>DEPARTMENT:</b> Computer Science", body_style)]
    ]
    info_table = Table(info_data, colWidths=[240, 247])
    info_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    logo_path = os.path.join(os.path.dirname(__file__), "client", "public", "images", "college-logo.png")
    if os.path.exists(logo_path):
        try:
            story.append(Image(logo_path, width=75, height=75))
            story.append(Spacer(1, 8))
        except Exception:
            pass

    story.append(Paragraph("GOVERNMENT ARTS AND SCIENCE COLLEGE", college_style))
    story.append(Paragraph("(Affiliated to Periyar University, Salem)<br/>Idappadi – 637 101, Salem District, Tamil Nadu", dept_style))
    story.append(Paragraph("<b>ACADEMIC YEAR 2025 – 2026</b>", ParagraphStyle('AcaYr', fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER, textColor=c_primary)))
    story.append(PageBreak())

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    add_header("CONTENTS")
    story.append(Spacer(1, 5))

    toc_data = [
        [Paragraph("<b>CHAPTER NO</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER, textColor=colors.white)),
         Paragraph("<b>PARTICULARS</b>", ParagraphStyle('THL', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
         Paragraph("<b>PAGE NO</b>", ParagraphStyle('THR', fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER, textColor=colors.white))],
        
        ["", Paragraph("COLLEGE BONAFIDE CERTIFICATE", body_style), Paragraph("i", center_bold)],
        ["", Paragraph("ACKNOWLEDGEMENT", body_style), Paragraph("ii", center_bold)],
        ["", Paragraph("SYNOPSIS", body_style), Paragraph("iii", center_bold)],
        ["<b>1</b>", Paragraph("<b>INTRODUCTION</b>", body_style), Paragraph("1", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.1 ABOUT THE PROJECT", body_style), Paragraph("1", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.2 SYSTEM CONFIGURATION", body_style), Paragraph("2", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2.1 HARDWARE REQUIREMENTS", body_style), Paragraph("2", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2.2 SOFTWARE REQUIREMENTS", body_style), Paragraph("2", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.2.3 SOFTWARE DESCRIPTION", body_style), Paragraph("3", center_bold)],
        ["<b>2</b>", Paragraph("<b>SYSTEM STUDY</b>", body_style), Paragraph("5", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 EXISTING SYSTEM", body_style), Paragraph("5", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1.1 DESCRIPTION", body_style), Paragraph("5", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1.2 DRAWBACKS", body_style), Paragraph("5", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 PROPOSED SYSTEM", body_style), Paragraph("6", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2.1 DESCRIPTION", body_style), Paragraph("6", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2.2 FEATURES", body_style), Paragraph("6", center_bold)],
        ["<b>3</b>", Paragraph("<b>SYSTEM DESIGN AND DEVELOPMENT</b>", body_style), Paragraph("8", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 FILE DESIGN", body_style), Paragraph("8", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 INPUT DESIGN", body_style), Paragraph("8", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.3 OUTPUT DESIGN", body_style), Paragraph("9", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.4 DATABASE DESIGN", body_style), Paragraph("9", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.5 CODE DESIGN", body_style), Paragraph("11", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.6 SYSTEM DEVELOPMENT", body_style), Paragraph("12", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3.6.1 DESCRIPTION OF MODULES", body_style), Paragraph("12", center_bold)],
        ["<b>4</b>", Paragraph("<b>SYSTEM TESTING AND IMPLEMENTATION</b>", body_style), Paragraph("15", center_bold)],
        ["<b>5</b>", Paragraph("<b>CONCLUSION</b>", body_style), Paragraph("17", center_bold)],
        ["<b>6</b>", Paragraph("<b>BIBLIOGRAPHY</b>", body_style), Paragraph("18", center_bold)],
        ["<b>7</b>", Paragraph("<b>APPENDICES</b>", body_style), Paragraph("19", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;A. DATA FLOW DIAGRAM", body_style), Paragraph("19", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;B. TABLE STRUCTURES", body_style), Paragraph("20", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;C. SAMPLE CODING", body_style), Paragraph("23", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;D. SAMPLE INPUT", body_style), Paragraph("26", center_bold)],
        ["", Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;E. SAMPLE OUTPUT", body_style), Paragraph("27", center_bold)]
    ]

    toc_table = Table(toc_data, colWidths=[65, 360, 62])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # =========================================================================
    # COLLEGE BONAFIDE CERTIFICATE
    # =========================================================================
    add_header("COLLEGE BONAFIDE CERTIFICATE")
    story.append(Paragraph("<b>GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI – 637 101</b>", center_bold))
    story.append(Paragraph("<b>DEPARTMENT OF COMPUTER SCIENCE</b>", ParagraphStyle('SubD', fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER, textColor=c_secondary, spaceAfter=25)))
    
    cert_text = """
    This is to certify that the project report entitled <b>"SMART SPORTS MANAGEMENT SYSTEM"</b> is a bonafide record of work done by <b>[Candidate Name]</b> (Register Number: <b>[Register Number]</b>) in partial fulfillment of the requirements for the award of the Degree of <b>BACHELOR OF SCIENCE IN COMPUTER SCIENCE</b> during the academic year <b>2025 – 2026</b>.
    """
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 15))
    story.append(Paragraph("This project work represents the original work carried out under the direct supervision of the undersigned faculty members, and it has not formed the basis for the award of any other degree, diploma, or title in any other institution.", body_style))
    story.append(Spacer(1, 60))

    sig_data = [
        [Paragraph("<b>Faculty Guide</b><br/>Department of Computer Science<br/>GASC, Idappadi", body_style),
         Paragraph("<b>Physical Director</b><br/>Dept. of Physical Education<br/>GASC, Idappadi", body_style),
         Paragraph("<b>Head of the Department</b><br/>Department of Computer Science<br/>GASC, Idappadi", body_style)]
    ]
    sig_table = Table(sig_data, colWidths=[160, 160, 167])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor("#0f4c81")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 40))

    story.append(Paragraph("Submitted for the Viva-Voce Examination held on: <b>_____________________</b>", body_style))
    story.append(Spacer(1, 35))

    exam_data = [
        [Paragraph("<b>INTERNAL EXAMINER</b>", body_style), Paragraph("<b>EXTERNAL EXAMINER</b>", ParagraphStyle('ExtEx', fontName='Helvetica-Bold', alignment=TA_RIGHT))]
    ]
    exam_table = Table(exam_data, colWidths=[240, 247])
    story.append(exam_table)
    story.append(PageBreak())

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    add_header("ACKNOWLEDGEMENT")
    ack_1 = """
    First and foremost, I express my deep sense of gratitude and reverence to Almighty God for the divine blessings, courage, and knowledge bestowed upon me to successfully complete this project report.
    """
    ack_2 = """
    I express my profound sense of gratitude to our respected <b>Principal</b>, Government Arts and Science College, Idappadi, for providing all the requisite college facilities, laboratory resources, and continuous encouragement during the tenure of our study.
    """
    ack_3 = """
    I express our heartfelt thanks to our respected <b>Head of the Department of Computer Science</b>, for their inspiring guidance, insightful advice, and valuable suggestions throughout this project development.
    """
    ack_4 = """
    I am immensely indebted to our esteemed <b>Project Guide</b>, Assistant Professor, Department of Computer Science, for their unstinted support, continuous monitoring, expert technical feedback, and scholarly supervision at every milestone of this project.
    """
    ack_5 = """
    I also extend our sincere thanks to the <b>Director of Physical Education & Sports</b> for providing essential sports domain requirements, collegiate roster details, tournament workflows, and equipment inventory records that shaped the core of this system.
    """
    ack_6 = """
    Finally, I convey our warm gratitude to all faculty members, lab technicians, beloved parents, and fellow classmates who extended their direct and indirect cooperation for the successful completion of this project.
    """
    for a in [ack_1, ack_2, ack_3, ack_4, ack_5, ack_6]:
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 4))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>[Candidate Name]</b><br/>Register No: [Register Number]<br/>Department of Computer Science", ParagraphStyle('SigR', fontName='Helvetica', alignment=TA_RIGHT, leading=14)))
    story.append(PageBreak())

    # =========================================================================
    # SYNOPSIS
    # =========================================================================
    add_header("SYNOPSIS")
    syn_1 = """
    The <b>Smart Sports Management System</b> for <b>Government Arts and Science College, Idappadi</b> is a modern, responsive, full-stack college sports web portal engineered to streamline and digitize collegiate sports administration, athlete enrollment, tournament scheduling, equipment inventory, daily attendance tracking, and achievement records.
    """
    syn_2 = """
    Traditionally, collegiate sports management at GASC Idappadi was conducted through manual logbooks, paper registration forms, and isolated Excel spreadsheets. This resulted in data fragmentation, delayed tournament notifications, equipment misplacement, lack of athlete performance history, and unauthorized registrations by outside individuals.
    """
    syn_3 = """
    To eliminate these challenges, the proposed system introduces:
    """
    story.append(Paragraph(syn_1, body_style))
    story.append(Paragraph(syn_2, body_style))
    story.append(Paragraph(syn_3, body_style))

    syn_bullets = [
        "<b>Strict Bonafide Roster Verification:</b> Direct integration with GASC Idappadi official master roll number list, prohibiting non-students from registering.",
        "<b>Automated Email OTP Authentication:</b> Implemented using <b>Nodemailer</b>, dispatching time-bound 6-digit verification codes to validate student email ownership.",
        "<b>Player Profile & Sports Portfolio:</b> Digital profiles capturing player athletic levels, department, jersey number, and tournament participation history.",
        "<b>Tournament & Fixtures Management:</b> Real-time scheduling of intramural and inter-collegiate events with live status (Upcoming, Ongoing, Completed).",
        "<b>Equipment Inventory & Stock Tracker:</b> Digital issuing and return tracking with automatic stock updates and condition auditing.",
        "<b>Attendance & Coaching Tracker:</b> Systematic morning and evening sports training session logs with attendance percentages.",
        "<b>Achievements Hall of Fame:</b> Showcase of state, district, and university sports medals and certificates.",
        "<b>Interactive Analytics & Supabase Database:</b> High-level department sports distribution charts and hybrid database sync with Cloud PostgreSQL."
    ]
    for sb in syn_bullets:
        story.append(Paragraph(f"• {sb}", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("The system is engineered using <b>Node.js, Express.js, MongoDB (Mongoose), Cloud Supabase, HTML5, CSS3 Glassmorphism, Vanilla JavaScript, and Bootstrap 5.3</b>, guaranteeing high performance, security, and an engaging user experience.", body_style))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_header("CHAPTER 1: INTRODUCTION")
    add_sub("1.1 ABOUT THE PROJECT")
    p1 = """
    Sports and physical education play an indispensable role in higher educational institutions, nurturing discipline, teamwork, leadership, physical fitness, and holistic personality development. At <b>Government Arts and Science College, Idappadi</b>, hundreds of enthusiastic student athletes participate in diverse sports including Cricket, Football, Volleyball, Kabaddi, Badminton, Athletics, Kho-Kho, Chess, and Table Tennis.
    """
    p2 = """
    The <b>Smart Sports Management System</b> is designed as a centralized digital ecosystem for the Department of Physical Education and Sports. The web portal bridges students, team captains, coaches, and the Physical Director onto a unified platform, replacing legacy manual record keeping with real-time digital automation.
    """
    p3 = """
    Key objectives of the project are:
    """
    story.append(Paragraph(p1, body_style))
    story.append(Paragraph(p2, body_style))
    story.append(Paragraph(p3, body_style))

    objs = [
        "To establish a secure, bonafide-verified digital registration system for all college student athletes.",
        "To provide email-based One-Time Password (OTP) verification for enhanced security and student account ownership.",
        "To maintain real-time tracking of college sports equipment inventory, stock levels, and issue-return workflows.",
        "To automate tournament scheduling, team formations, and live score/winner publication.",
        "To track daily practice session attendance and analyze athletic consistency across academic departments.",
        "To build an inspiring digital Hall of Fame celebrating student athletic accomplishments."
    ]
    for ob in objs:
        story.append(Paragraph(f"• {ob}", bullet_style))

    story.append(Spacer(1, 6))
    add_sub("1.2 SYSTEM CONFIGURATION")
    story.append(Paragraph("The hardware and software environments required for designing, developing, and deploying the Smart Sports Management System are outlined below:", body_style))

    add_sub3("1.2.1 HARDWARE REQUIREMENTS")
    hw_data = [
        [Paragraph("<b>Component</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
         Paragraph("<b>Minimum Requirement</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
         Paragraph("<b>Recommended Specification</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))],
        [Paragraph("Processor", body_style), Paragraph("Intel Core i3 / AMD Ryzen 3 (2.0 GHz)", body_style), Paragraph("Intel Core i5 / AMD Ryzen 5 or higher", body_style)],
        [Paragraph("RAM", body_style), Paragraph("4 GB DDR4", body_style), Paragraph("8 GB / 16 GB DDR4/DDR5", body_style)],
        [Paragraph("Hard Disk / Storage", body_style), Paragraph("10 GB Free Storage Space", body_style), Paragraph("256 GB NVMe SSD or higher", body_style)],
        [Paragraph("Display Resolution", body_style), Paragraph("1024 x 768 pixels", body_style), Paragraph("1920 x 1080 Full HD or higher", body_style)],
        [Paragraph("Network Connectivity", body_style), Paragraph("Standard Broadband / 4G (1 Mbps)", body_style), Paragraph("High Speed Internet (10 Mbps+)", body_style)]
    ]
    hw_table = Table(hw_data, colWidths=[120, 180, 187])
    hw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(hw_table)
    story.append(Spacer(1, 8))

    add_sub3("1.2.2 SOFTWARE REQUIREMENTS")
    sw_data = [
        [Paragraph("<b>Category</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
         Paragraph("<b>Software / Tool Specification</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))],
        [Paragraph("Operating System", body_style), Paragraph("Microsoft Windows 10 / 11, Linux (Ubuntu 22.04+), or macOS", body_style)],
        [Paragraph("Runtime Environment", body_style), Paragraph("Node.js (v18.x / v20.x / v24.x LTS)", body_style)],
        [Paragraph("Web Server Framework", body_style), Paragraph("Express.js (v4.19.2)", body_style)],
        [Paragraph("Database Engine", body_style), Paragraph("MongoDB Community Server v7.0+ & Supabase Cloud PostgreSQL", body_style)],
        [Paragraph("Database ODM / Client", body_style), Paragraph("Mongoose (v8.5.2) & @supabase/supabase-js (v2.115.0)", body_style)],
        [Paragraph("Email Dispatch Engine", body_style), Paragraph("Nodemailer (v6.9.16) via SMTP Protocol", body_style)],
        [Paragraph("User Interface Technologies", body_style), Paragraph("HTML5, CSS3 (Glassmorphism), Vanilla JavaScript, Bootstrap 5.3", body_style)],
        [Paragraph("Code Editor / IDE", body_style), Paragraph("Visual Studio Code / Antigravity IDE", body_style)],
        [Paragraph("Web Browsers", body_style), Paragraph("Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari", body_style)]
    ]
    sw_table = Table(sw_data, colWidths=[150, 337])
    sw_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(sw_table)
    story.append(Spacer(1, 8))

    add_sub3("1.2.3 SOFTWARE DESCRIPTION")
    s_desc = [
        "<b>Node.js & Express.js:</b> Node.js provides an asynchronous, event-driven JavaScript runtime engine. Express.js acts as the backend routing framework that handles incoming REST API endpoints, CORS policies, static file serving, and JWT middleware token validation.",
        "<b>MongoDB & Mongoose:</b> MongoDB is a high-performance NoSQL document database storing data in JSON-like BSON format. Mongoose provides schema validation, TTL auto-expiration indexes for OTP records, reference population, and pre-save password hashing hooks.",
        "<b>Supabase Cloud Database:</b> Integrated as a modern relational layer utilizing PostgreSQL, enabling real-time administrative database replication, structured SQL queries, and remote cloud backups.",
        "<b>Nodemailer Email Engine:</b> Node.js module used for dispatching secure SMTP emails. It builds dynamic, responsive HTML email templates with college branding and delivers 6-digit verification codes to student inboxes.",
        "<b>Bootstrap 5.3 & CSS3 Glassmorphism:</b> Frontend design framework providing mobile-responsive flexbox layouts, interactive modals, responsive tables, gradient accents, and frosted-glass blur effects."
    ]
    for sd in s_desc:
        story.append(Paragraph(sd, body_style))

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 2: SYSTEM STUDY
    # =========================================================================
    add_header("CHAPTER 2: SYSTEM STUDY")
    add_sub("2.1 EXISTING SYSTEM")
    add_sub3("2.1.1 DESCRIPTION")
    es_desc = """
    Prior to the development of this portal, the sports administration at Government Arts and Science College, Idappadi operated entirely through conventional paper-based records and isolated spreadsheets. 
    The Physical Director and sports coordinators had to manually maintain register notebooks for athletic entries, physical sign-in sheets for daily coaching attendance, ledger books for sports equipment stock, and paper circulars posted on department notice boards for tournament announcements.
    """
    story.append(Paragraph(es_desc, body_style))

    add_sub3("2.1.2 DRAWBACKS OF THE EXISTING SYSTEM")
    drawbacks = [
        "<b>Data Redundancy & Paper Degradation:</b> Manual records are vulnerable to physical wear, misplacement, and moisture damage.",
        "<b>Unauthorized Registrations:</b> Absence of verification allowed external individuals to register under fake identity numbers.",
        "<b>Equipment Mismanagement:</b> Lack of real-time stock alerts led to lost balls, unreturned jerseys, and unaccounted sports goods.",
        "<b>Inefficient Communication:</b> Tournament dates and practice schedules were announced via notice boards, causing missed events.",
        "<b>No Centralized Athlete History:</b> Physical directors could not instantly retrieve an athlete's multi-year performance or medal track record.",
        "<b>Tedious Report Generation:</b> Compiling annual sports day reports for university audits required days of manual ledger calculations."
    ]
    for db in drawbacks:
        story.append(Paragraph(f"• {db}", bullet_style))

    story.append(Spacer(1, 6))
    add_sub("2.2 PROPOSED SYSTEM")
    add_sub3("2.2.1 DESCRIPTION")
    ps_desc = """
    The <b>Smart Sports Management System</b> resolves all shortcomings of the legacy model by establishing an automated, secure, web-enabled digital portal. The system introduces an institutional bonafide student roll check combined with an active Email OTP verification engine, ensuring strictly genuine college athletes access the portal.
    """
    story.append(Paragraph(ps_desc, body_style))

    add_sub3("2.2.2 FEATURES OF THE PROPOSED SYSTEM")
    features = [
        "<b>Collegiate Roster Enforcement:</b> Automated verification against GASC Idappadi master student list (e.g. 23UGCS101 - 24UGCO205).",
        "<b>Email OTP Verification:</b> 6-digit numeric OTP sent via Nodemailer with 10-minute auto-expiry and 45s resend rate-limiting.",
        "<b>Unified Role-Based Access:</b> Distinct secure dashboards for Sports Administrators (Physical Director) and Student Athletes.",
        "<b>Complete Equipment Inventory:</b> Live stock counting, issuance logging, return auditing, and maintenance status tracking.",
        "<b>Tournament & Event Hub:</b> Real-time fixtures, team rosters, venue tracking, and digital winner certificates.",
        "<b>Practice & Attendance Analytics:</b> Session tracking with visual percentage bars and departmental participation metrics.",
        "<b>Multimedia Sports Gallery:</b> Digital album documenting annual sports days, inter-collegiate tournaments, and medal ceremonies."
    ]
    for ft in features:
        story.append(Paragraph(f"• {ft}", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: SYSTEM DESIGN AND DEVELOPMENT
    # =========================================================================
    add_header("CHAPTER 3: SYSTEM DESIGN AND DEVELOPMENT")
    add_sub("3.1 FILE DESIGN")
    fd_text = """
    The project repository is architected following a modular, clean Model-View-Controller (MVC) and Service-Oriented pattern:
    """
    story.append(Paragraph(fd_text, body_style))

    files_list = [
        "<b>/server/models/:</b> Mongoose schema definitions (User.js, Otp.js, PlayerProfile.js, CollegeStudentRoster.js, Equipment.js, Competition.js, Attendance.js, Achievement.js, Team.js, Sport.js, Gallery.js, Notification.js).",
        "<b>/server/controllers/:</b> Core business logic and request handlers (authController.js, playerController.js, equipmentController.js, competitionController.js, etc.).",
        "<b>/server/routes/:</b> Express REST API route definitions with endpoint mapping and middleware guards.",
        "<b>/server/utils/:</b> Helper utilities including emailService.js (Nodemailer), seedData.js, and supabaseSync.js.",
        "<b>/server/middleware/:</b> Security middleware (authMiddleware.js for JWT verification, uploadMiddleware.js for Multer storage).",
        "<b>/client/public/:</b> Frontend single-page views (index.html, register.html, login.html, student-dashboard.html, admin-dashboard.html, sports.html, etc.).",
        "<b>/client/public/js/:</b> Client logic scripts (auth.js, api.js, student.js, admin.js, charts.js, public.js)."
    ]
    for fl in files_list:
        story.append(Paragraph(f"• {fl}", bullet_style))

    story.append(Spacer(1, 6))
    add_sub("3.2 INPUT DESIGN")
    story.append(Paragraph("Input design ensures that data entered into the system is accurate, validated, and user-friendly. Key input interfaces include:", body_style))
    inputs = [
        "<b>Student Registration Form:</b> Captures Register Number, Name, Department, Year, Gender, Mobile, Email, Password, and Profile Photo with real-time bonafide checks.",
        "<b>Email OTP Verification Box:</b> 6-digit PIN input with automatic numeric masking, auto-paste support, and countdown timers.",
        "<b>Tournament Entry Form:</b> Captures competition title, sports category, tournament type, date/time, venue, max team size, and rules.",
        "<b>Equipment Transaction Form:</b> Records student register number, equipment item, quantity borrowed, expected return date, and item condition.",
        "<b>Daily Attendance Entry:</b> Rapid toggle interface marking Present/Absent status for sports coaching cohorts."
    ]
    for inp in inputs:
        story.append(Paragraph(f"• {inp}", bullet_style))

    story.append(Spacer(1, 6))
    add_sub("3.3 OUTPUT DESIGN")
    story.append(Paragraph("Output design presents actionable, clear, and visually appealing information to students and faculty administrators:", body_style))
    outputs = [
        "<b>Student Athlete Sports ID & Dashboard:</b> Digital player card displaying primary sport, department, jersey number, and tournament history.",
        "<b>Branded Verification Email:</b> HTML email delivered to students containing the college header, 6-digit OTP code, and validity period.",
        "<b>Executive Admin Dashboard:</b> Real-time metric cards showing total players, active tournaments, low stock equipment alerts, and today's attendance.",
        "<b>Department Participation Charts:</b> Interactive Chart.js doughnut and bar charts visualizing sports involvement across academic streams.",
        "<b>Equipment Stock Summary & Reports:</b> Tabular views highlighting available vs borrowed inventory with overdue flags."
    ]
    for out in outputs:
        story.append(Paragraph(f"• {out}", bullet_style))

    story.append(Spacer(1, 6))
    add_sub("3.4 DATABASE DESIGN")
    db_text = """
    The system utilizes a dual-database architecture. The primary operational database is <b>MongoDB</b> with high scalability and JSON-native document models. In parallel, <b>Cloud Supabase (PostgreSQL)</b> acts as a relational replication layer for administrative sync and analytics.
    """
    story.append(Paragraph(db_text, body_style))

    # Schema summary table
    schema_summary = [
        [Paragraph("<b>Collection / Table</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Primary Key / Index</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Description & Purpose</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        [Paragraph("users", body_style), Paragraph("_id, registerNumber, email", body_style), Paragraph("Stores student athletes and sports administrator account credentials.", body_style)],
        [Paragraph("otps", body_style), Paragraph("_id, email (TTL 600s)", body_style), Paragraph("Stores 6-digit email OTPs with auto-expiration index.", body_style)],
        [Paragraph("collegestudentrosters", body_style), Paragraph("_id, registerNumber", body_style), Paragraph("GASC Idappadi official roll master list imported from college records.", body_style)],
        [Paragraph("playerprofiles", body_style), Paragraph("_id, userId", body_style), Paragraph("Athletic details, primary sport, jersey number, and level.", body_style)],
        [Paragraph("sports", body_style), Paragraph("_id, name", body_style), Paragraph("Catalog of college sports (Cricket, Football, Kabaddi, etc.).", body_style)],
        [Paragraph("equipment", body_style), Paragraph("_id, itemCode", body_style), Paragraph("Sports gear inventory, total stock, available quantity, condition.", body_style)],
        [Paragraph("equipmenttransactions", body_style), Paragraph("_id, equipmentId, studentId", body_style), Paragraph("Issue and return transaction history with dates and status.", body_style)],
        [Paragraph("competitions", body_style), Paragraph("_id, sportId", body_style), Paragraph("Tournament schedules, fixtures, matches, and results.", body_style)],
        [Paragraph("attendances", body_style), Paragraph("_id, studentId, date", body_style), Paragraph("Daily morning and evening athletic coaching logs.", body_style)]
    ]
    sch_table = Table(schema_summary, colWidths=[120, 140, 227])
    sch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(sch_table)
    story.append(Spacer(1, 8))

    add_sub("3.5 CODE DESIGN")
    story.append(Paragraph("The software codebase adheres to industry best practices, featuring RESTful API conventions, separation of concerns, structured error handling middleware, JWT token verification, and automated email dispatching with fallback simulation.", body_style))

    add_sub("3.6 SYSTEM DEVELOPMENT")
    add_sub3("3.6.1 DESCRIPTION OF MODULES")
    modules = [
        "<b>1. Bonafide Authentication & Email OTP Module:</b> Validates candidate register numbers against the college roster. Generates cryptographic 6-digit OTP codes, dispatches HTML emails via Nodemailer, enforces 10-minute expiry, and checks verified status before account creation.",
        "<b>2. Student Athlete Profile & Sports Enrollment Module:</b> Allows students to build athletic resumes, select primary/secondary sports, view personal tournament history, and update contact details.",
        "<b>3. Tournament & Fixtures Scheduling Module:</b> Enables the Physical Director to publish intramural, zonal, and university level tournaments, track team registrations, and record match results.",
        "<b>4. Sports Equipment Inventory & Stock Module:</b> Manages college sports goods (balls, bats, nets, protective gear) with real-time stock deductions on issue and restock on return.",
        "<b>5. Practice Session & Attendance Tracker Module:</b> Records attendance for athletic conditioning camps, providing students and coaches with attendance percentages.",
        "<b>6. Achievements & Hall of Fame Module:</b> Spotlights medals, trophies, and tournament recognitions won by GASC Idappadi students across state and district meets.",
        "<b>7. Executive Analytics & Supabase Sync Module:</b> Visualizes department-wise sports distribution through interactive charts and provides dual database sync with Cloud Supabase."
    ]
    for mod in modules:
        story.append(Paragraph(mod, body_style))

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: SYSTEM TESTING AND IMPLEMENTATION
    # =========================================================================
    add_header("CHAPTER 4: SYSTEM TESTING AND IMPLEMENTATION")
    story.append(Paragraph("System testing is a crucial phase in the software development lifecycle that ensures the software meets all specified functional, performance, and security requirements without defects.", body_style))

    test_types = [
        "<b>1. Unit Testing:</b> Individual backend controller functions and utility methods (such as OTP generation, Bcrypt password hashing, register number regex validation, and email masking) were tested independently with mock payloads.",
        "<b>2. Integration Testing:</b> Data flow between frontend AJAX requests (`api.js`), Express REST API route handlers (`authRoutes.js`), and MongoDB Mongoose database operations was verified end-to-end.",
        "<b>3. Validation & Bonafide Testing:</b> Tested edge cases including non-enrolled register numbers, duplicate email registrations, expired OTP codes, and mismatched passwords.",
        "<b>4. Security & Access Control Testing:</b> Validated that protected API routes (e.g. equipment issue, tournament creation, roster upload) strictly require valid Admin JWT bearer tokens.",
        "<b>5. User Acceptance Testing (UAT):</b> Demonstrated the system to college sports department coordinators and student athlete representatives for usability feedback."
    ]
    for tt in test_types:
        story.append(Paragraph(tt, body_style))

    story.append(Spacer(1, 8))
    add_sub("Test Cases & Results Summary")
    tc_data = [
        [Paragraph("<b>Test Case ID</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Test Scenario / Input</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Expected Output</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Status</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        [Paragraph("TC_AUTH_01", body_style), Paragraph("Valid GASC Reg No (23UGCS101)", body_style), Paragraph("Student verified; details auto-populated", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)],
        [Paragraph("TC_AUTH_02", body_style), Paragraph("Invalid Reg No (99UGZZ999)", body_style), Paragraph("Access Denied: Outsider error shown", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)],
        [Paragraph("TC_AUTH_03", body_style), Paragraph("Send OTP to valid email", body_style), Paragraph("6-digit OTP emailed & countdown started", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)],
        [Paragraph("TC_AUTH_04", body_style), Paragraph("Submit wrong OTP code", body_style), Paragraph("Invalid code warning; retry decremented", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)],
        [Paragraph("TC_AUTH_05", body_style), Paragraph("Submit correct 6-digit OTP", body_style), Paragraph("Email Verified badge shown & unlocked submit", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)],
        [Paragraph("TC_EQP_01", body_style), Paragraph("Issue cricket bat to player", body_style), Paragraph("Stock decremented; transaction logged", body_style), Paragraph("<font color='#05c46b'><b>PASSED</b></font>", body_style)]
    ]
    tc_table = Table(tc_data, colWidths=[70, 160, 197, 60])
    tc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (3,1), (3,-1), 'CENTER')
    ]))
    story.append(tc_table)
    story.append(Spacer(1, 8))

    add_sub("Implementation & Deployment")
    impl_text = """
    The application is deployed locally via Node.js runtime and is ready for production hosting on platforms such as Render, Railway, or VPS servers. Frontend static assets are served directly through Express.js with gzip compression and cross-origin resource sharing (CORS) configured.
    """
    story.append(Paragraph(impl_text, body_style))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: CONCLUSION
    # =========================================================================
    add_header("CHAPTER 5: CONCLUSION")
    c1 = """
    The <b>Smart Sports Management System</b> successfully transforms the athletic and sports administration at <b>Government Arts and Science College, Idappadi</b> from a fragmented, paper-bound approach into an advanced, integrated, web-enabled digital platform.
    """
    c2 = """
    By implementing strict bonafide collegiate roster checks and real-time Email OTP verification with Nodemailer, the system establishes a secure foundation where only genuine college students can enroll and participate. The portal eliminates equipment loss through live stock auditing, improves student tournament attendance through transparent scheduling, and builds institutional pride through the digital Hall of Fame.
    """
    c3 = """
    <b>Future Enhancements:</b>
    """
    story.append(Paragraph(c1, body_style))
    story.append(Paragraph(c2, body_style))
    story.append(Paragraph(c3, body_style))

    future_enhancements = [
        "<b>Automated SMS / WhatsApp Notifications:</b> Integrating WhatsApp Business API / Twilio SMS for instant fixture reminders.",
        "<b>QR Code Student Sports ID Cards:</b> Generating dynamic QR codes for rapid equipment check-out and attendance scanning.",
        "<b>Live Match Scoreboards:</b> Real-time WebSocket scoring updates for college sports day athletic events.",
        "<b>Mobile Application (PWA / Flutter):</b> Packaging the portal into a Progressive Web App for offline sports ground access."
    ]
    for fe in future_enhancements:
        story.append(Paragraph(f"• {fe}", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: BIBLIOGRAPHY
    # =========================================================================
    add_header("CHAPTER 6: BIBLIOGRAPHY")
    story.append(Paragraph("<b>Reference Textbooks:</b>", h2_style))
    books = [
        "1. Flannagan, David. <i>JavaScript: The Definitive Guide (7th Edition)</i>. O'Reilly Media, 2020.",
        "2. Chodorow, Kristina. <i>MongoDB: The Definitive Guide (3rd Edition)</i>. O'Reilly Media, 2020.",
        "3. Brown, Ethan. <i>Web Development with Node and Express (2nd Edition)</i>. O'Reilly Media, 2019.",
        "4. Duckett, Jon. <i>HTML and CSS: Design and Build Websites</i>. John Wiley & Sons, 2011.",
        "5. Pressman, Roger S. <i>Software Engineering: A Practitioner's Approach (8th Edition)</i>. McGraw-Hill Education, 2014."
    ]
    for b in books:
        story.append(Paragraph(b, body_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Web Resources & Documentation:</b>", h2_style))
    urls = [
        "1. Node.js Official Documentation: <font color='#0f4c81'>https://nodejs.org/en/docs/</font>",
        "2. Express.js Web Framework Guide: <font color='#0f4c81'>https://expressjs.com/</font>",
        "3. MongoDB & Mongoose ODM Manual: <font color='#0f4c81'>https://mongoosejs.com/docs/</font>",
        "4. Nodemailer Email Protocol Library: <font color='#0f4c81'>https://nodemailer.com/</font>",
        "5. Bootstrap 5.3 UI Framework: <font color='#0f4c81'>https://getbootstrap.com/docs/5.3/</font>",
        "6. Supabase Cloud PostgreSQL Reference: <font color='#0f4c81'>https://supabase.com/docs</font>"
    ]
    for u in urls:
        story.append(Paragraph(u, body_style))

    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 7: APPENDICES
    # =========================================================================
    add_header("CHAPTER 7: APPENDICES")
    
    add_sub("A. DATA FLOW DIAGRAM (DFD)")
    story.append(Paragraph("<b>Level 0 DFD (Context Diagram):</b>", h3_style))
    dfd0_text = """
    [Student Athlete]  <==== (Registration, OTP, Sports Profile) ====>  [ SMART SPORTS SYSTEM ]  <==== (Manage Sports, Inventory, Fixtures) ====>  [ Physical Director / Admin ]
                                                                             ||
                                                                      [ MongoDB / Supabase ]
    """
    story.append(Preformatted(dfd0_text, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Level 1 DFD (Core Processing Modules):</b>", h3_style))
    dfd1_text = """
    1.0 Registration & OTP  ==> [Verify Master Roll] ==> [Send Email OTP via Nodemailer] ==> [Activate Student Profile]
    2.0 Tournament Module   ==> [Admin Schedules Event] ==> [Student Enrolls Team] ==> [Publish Live Results]
    3.0 Equipment Inventory ==> [Check Stock] ==> [Issue Item to Student] ==> [Update Quantity & Audit Return]
    4.0 Coaching Attendance ==> [Daily Session Sign-in] ==> [Record in DB] ==> [Calculate Attendance %]
    """
    story.append(Preformatted(dfd1_text, code_style))
    story.append(Spacer(1, 10))

    add_sub("B. TABLE STRUCTURES")
    
    # Table 1: users
    story.append(Paragraph("<b>Table 1: users (Student & Admin Accounts)</b>", h3_style))
    u_table_data = [
        [Paragraph("<b>Field Name</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Data Type</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Constraint</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Description</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        [Paragraph("_id", body_style), Paragraph("ObjectId", body_style), Paragraph("Primary Key", body_style), Paragraph("Unique document identifier", body_style)],
        [Paragraph("name", body_style), Paragraph("String", body_style), Paragraph("Required, Trim", body_style), Paragraph("Student athlete full name", body_style)],
        [Paragraph("registerNumber", body_style), Paragraph("String", body_style), Paragraph("Unique, Indexed", body_style), Paragraph("GASC Idappadi Roll Number", body_style)],
        [Paragraph("email", body_style), Paragraph("String", body_style), Paragraph("Unique, Required", body_style), Paragraph("Verified student email address", body_style)],
        [Paragraph("password", body_style), Paragraph("String", body_style), Paragraph("Bcrypt Hashed", body_style), Paragraph("Encrypted password string", body_style)],
        [Paragraph("role", body_style), Paragraph("String", body_style), Paragraph("student | admin", body_style), Paragraph("User permission role", body_style)],
        [Paragraph("department", body_style), Paragraph("String", body_style), Paragraph("Default 'General'", body_style), Paragraph("Academic department name", body_style)],
        [Paragraph("status", body_style), Paragraph("String", body_style), Paragraph("Active | Inactive", body_style), Paragraph("Account active status", body_style)]
    ]
    u_tab = Table(u_table_data, colWidths=[90, 80, 110, 207])
    u_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(u_tab)
    story.append(Spacer(1, 8))

    # Table 2: otps
    story.append(Paragraph("<b>Table 2: otps (Email Verification Codes)</b>", h3_style))
    otp_table_data = [
        [Paragraph("<b>Field Name</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Data Type</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Constraint</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Description</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        [Paragraph("_id", body_style), Paragraph("ObjectId", body_style), Paragraph("Primary Key", body_style), Paragraph("Unique OTP record ID", body_style)],
        [Paragraph("email", body_style), Paragraph("String", body_style), Paragraph("Required, Indexed", body_style), Paragraph("Target recipient email address", body_style)],
        [Paragraph("otp", body_style), Paragraph("String", body_style), Paragraph("6-digit code", body_style), Paragraph("Cryptographic random verification code", body_style)],
        [Paragraph("verified", body_style), Paragraph("Boolean", body_style), Paragraph("Default false", body_style), Paragraph("Flag indicating successful verification", body_style)],
        [Paragraph("attempts", body_style), Paragraph("Number", body_style), Paragraph("Max 5 retries", body_style), Paragraph("Failed verification attempt counter", body_style)],
        [Paragraph("createdAt", body_style), Paragraph("Date", body_style), Paragraph("TTL index (600s)", body_style), Paragraph("Auto-deletes record after 10 mins", body_style)],
        [Paragraph("expiresAt", body_style), Paragraph("Date", body_style), Paragraph("Required", body_style), Paragraph("Explicit expiration timestamp", body_style)]
    ]
    otp_tab = Table(otp_table_data, colWidths=[90, 80, 110, 207])
    otp_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(otp_tab)
    story.append(Spacer(1, 8))

    # Table 3: equipment
    story.append(Paragraph("<b>Table 3: equipment (Sports Inventory Master)</b>", h3_style))
    eq_table_data = [
        [Paragraph("<b>Field Name</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Data Type</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Constraint</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white)),
         Paragraph("<b>Description</b>", ParagraphStyle('THC', fontName='Helvetica-Bold', fontSize=8, textColor=colors.white))],
        [Paragraph("itemName", body_style), Paragraph("String", body_style), Paragraph("Required", body_style), Paragraph("Equipment title (e.g. Cricket Bat)", body_style)],
        [Paragraph("sport", body_style), Paragraph("ObjectId", body_style), Paragraph("Ref 'Sport'", body_style), Paragraph("Associated sport category", body_style)],
        [Paragraph("totalQuantity", body_style), Paragraph("Number", body_style), Paragraph("Min 0", body_style), Paragraph("Total stock purchased by college", body_style)],
        [Paragraph("availableQuantity", body_style), Paragraph("Number", body_style), Paragraph("Min 0", body_style), Paragraph("Current unissued stock in storeroom", body_style)],
        [Paragraph("condition", body_style), Paragraph("String", body_style), Paragraph("Good | Damaged", body_style), Paragraph("Equipment physical usability state", body_style)]
    ]
    eq_tab = Table(eq_table_data, colWidths=[90, 80, 110, 207])
    eq_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(eq_tab)
    story.append(Spacer(1, 10))

    add_sub("C. SAMPLE CODING")
    story.append(Paragraph("<b>1. Email OTP Controller Endpoint (`authController.js`):</b>", h3_style))
    sample_code_1 = """
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email, registerNumber, name } = req.body;
    const cleanRegNo = registerNumber.toUpperCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check GASC College Student Roster
    const rosterStudent = await CollegeStudentRoster.findOne({ registerNumber: cleanRegNo });
    if (!rosterStudent) {
      return res.status(403).json({ success: false, message: 'Access Denied: Outsiders cannot register.' });
    }

    // 2. Generate 6-Digit OTP & 10 Min Expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email: cleanEmail, purpose: 'registration' });
    await Otp.create({ email: cleanEmail, otp: otpCode, registerNumber: cleanRegNo, expiresAt });

    // 3. Dispatch Email via Nodemailer
    await sendOtpEmail({ to: cleanEmail, name: rosterStudent.name, registerNumber: cleanRegNo, otp: otpCode });
    res.json({ success: true, message: 'OTP sent successfully to student email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
    """
    story.append(Preformatted(sample_code_1.strip(), code_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>2. Nodemailer Transporter Service (`emailService.js`):</b>", h3_style))
    sample_code_2 = """
const nodemailer = require('nodemailer');

const sendOtpEmail = async ({ to, name, registerNumber, otp, expiryMinutes = 10 }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  return await transporter.sendMail({
    from: '"GASC Idappadi Sports" <sports@gascidappadi.edu.in>',
    to,
    subject: `[GASC Sports] ${otp} is your Student Registration OTP`,
    html: `<div style="padding:20px; text-align:center;">
             <h2>Government Arts and Science College, Idappadi</h2>
             <p>Your 6-digit OTP is: <b style="font-size:24px;">${otp}</b></p>
             <small>Valid for ${expiryMinutes} minutes</small>
           </div>`
  });
};
    """
    story.append(Preformatted(sample_code_2.strip(), code_style))
    story.append(Spacer(1, 10))

    add_sub("D. SAMPLE INPUT")
    inputs_text = """
    1. Student Registration Input:
       • College Register Number: 23UGCS103
       • Student Name: Suresh P
       • Department: B.Sc Computer Science | Year: II Year | Section: A | Gender: Male
       • Email Address: suresh.cs@gmail.com
       • OTP Code: 789456

    2. Equipment Issue Input:
       • Item: SG Cricket Bat English Willow
       • Issued To: Suresh P (23UGCS103) | Quantity: 1
       • Issue Date: 05/09/2026 | Expected Return: 12/09/2026
    """
    story.append(Preformatted(inputs_text.strip(), code_style))
    story.append(Spacer(1, 10))

    add_sub("E. SAMPLE OUTPUT")
    outputs_text = """
    1. Email OTP Dispatch Response:
       {
         "success": true,
         "message": "OTP verification code sent to s***h@gmail.com. Please check your inbox.",
         "email": "suresh.cs@gmail.com",
         "maskedEmail": "s***h@gmail.com",
         "deliveryMode": "smtp"
       }

    2. Student Athlete Profile Response:
       {
         "success": true,
         "user": {
           "name": "Suresh P",
           "registerNumber": "23UGCS103",
           "department": "Computer Science",
           "year": "II Year",
           "role": "student",
           "status": "Active"
         }
       }
    """
    story.append(Preformatted(outputs_text.strip(), code_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF successfully generated: {filename}")


if __name__ == "__main__":
    out_file = "GASC_Idappadi_Sports_Project_Report.pdf"
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    build_pdf(out_file)
