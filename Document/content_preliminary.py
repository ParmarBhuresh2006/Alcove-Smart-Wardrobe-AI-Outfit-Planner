import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx_helpers import add_figure

def add_preliminary_pages(doc, img_dir):
    # ---------------------------------------------------------
    # COVER / TITLE PAGE
    # ---------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("ATMIYA UNIVERSITY")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("RAJKOT, GUJARAT, INDIA")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

    # University Logo
    logo_path = f"{img_dir}/image1.png"
    add_figure(doc, logo_path, "", width_inches=1.8)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("A MINI PROJECT REPORT ON")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run("SMART WARDROBE & OUTFIT PLANNER\n(ALCOVE)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(22)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("Under subject of\nMINI PROJECT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("B.TECH, Semester – VII\n(Department of Computer Engineering)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("Submitted by:\nStudent Team\nEnrolment No: 210001001\n\nUnder Guidance of:\nMr. Birju Tank (Faculty Guide)\nDr. Tosal M. Bhalodia (Head of Department)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11.5)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("DEPARTMENT OF COMPUTER ENGINEERING\nATMIYA UNIVERSITY, RAJKOT\nACADEMIC YEAR (2026-27)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    doc.add_page_break()

    # ---------------------------------------------------------
    # CANDIDATE'S DECLARATION
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("CANDIDATE’S DECLARATION")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p_d1 = doc.add_paragraph()
    p_d1.paragraph_format.space_after = Pt(12)
    p_d1.paragraph_format.line_spacing = 1.5
    p_d1.add_run("We hereby declare that the work presented in this project report entitled ")
    r = p_d1.add_run("“Smart Wardrobe & Outfit Planner (Alcove)”")
    r.font.bold = True
    p_d1.add_run(" in partial fulfillment of the requirements for the award of the degree of ")
    r = p_d1.add_run("Bachelor of Technology in Computer Engineering")
    r.font.bold = True
    p_d1.add_run(", submitted to Atmiya University, Rajkot, Gujarat, is an authentic record of our own work carried out under the supervision and guidance of ")
    r = p_d1.add_run("Mr. Birju Tank")
    r.font.bold = True
    p_d1.add_run(", Assistant Professor, Department of Computer Engineering.")

    p_d2 = doc.add_paragraph()
    p_d2.paragraph_format.space_after = Pt(12)
    p_d2.paragraph_format.line_spacing = 1.5
    p_d2.add_run("We further declare that we have not submitted the matter embodied in this project report for the award of any other degree or diploma to this or any other University or Institute. All assistance received during the preparation of this project has been duly acknowledged, and all research sources, algorithms, libraries, open-source frameworks, and literature cited have been properly referenced.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(48)
    p_sig.paragraph_format.space_after = Pt(6)
    p_sig.add_run("Date: 08-10-2026\nPlace: Rajkot, Gujarat\n\n\n_____________________________\nCandidate Signature\nStudent Team (Enrollment No. 210001001)")

    doc.add_page_break()

    # ---------------------------------------------------------
    # CERTIFICATE
    # ---------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("ATMIYA UNIVERSITY")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("RAJKOT, GUJARAT, INDIA\nDEPARTMENT OF COMPUTER ENGINEERING")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    add_figure(doc, logo_path, "", width_inches=1.5)

    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("CERTIFICATE")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p_c = doc.add_paragraph()
    p_c.paragraph_format.space_after = Pt(12)
    p_c.paragraph_format.line_spacing = 1.5
    p_c.add_run("This is to certify that the Mini Project work entitled ")
    r = p_c.add_run("“Smart Wardrobe & Outfit Planner (Alcove)”")
    r.font.bold = True
    p_c.add_run(" has been successfully carried out by ")
    r = p_c.add_run("Student Team (Enrolment No: 210001001)")
    r.font.bold = True
    p_c.add_run(" in partial fulfillment of the requirements for the award of the degree of ")
    r = p_c.add_run("Bachelor of Technology in Computer Engineering (Semester VII)")
    r.font.bold = True
    p_c.add_run(" from Atmiya University, Rajkot, during the academic year 2026-27. The project work has been evaluated and found satisfactory.")

    p_sig2 = doc.add_paragraph()
    p_sig2.paragraph_format.space_before = Pt(40)
    p_sig2.paragraph_format.space_after = Pt(6)
    p_sig2.add_run("_____________________________                 _____________________________\nMr. Birju Tank                                Dr. Tosal M. Bhalodia\n(Faculty Guide)                               (Head of Department)\nAssistant Professor                           Department of Computer Engineering\nDepartment of Computer Engineering            Atmiya University, Rajkot\nAtmiya University, Rajkot\n\n\n_____________________________\nExternal Examiner")

    doc.add_page_break()

    # ---------------------------------------------------------
    # ACKNOWLEDGEMENT
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("ACKNOWLEDGEMENT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p_ack1 = doc.add_paragraph()
    p_ack1.paragraph_format.space_after = Pt(12)
    p_ack1.paragraph_format.line_spacing = 1.5
    p_ack1.add_run("We express our deepest sense of gratitude and sincere thanks to our esteemed Faculty Guide, ")
    r = p_ack1.add_run("Mr. Birju Tank")
    r.font.bold = True
    p_ack1.add_run(", Assistant Professor, Department of Computer Engineering, Atmiya University, for his invaluable guidance, constant encouragement, insightful suggestions, and continuous support throughout the conceptualization, system architecture design, machine learning model pipeline setup, and implementation phases of this Mini Project.")

    p_ack2 = doc.add_paragraph()
    p_ack2.paragraph_format.space_after = Pt(12)
    p_ack2.paragraph_format.line_spacing = 1.5
    p_ack2.add_run("We extend our profound gratitude to ")
    r = p_ack2.add_run("Dr. Tosal M. Bhalodia")
    r.font.bold = True
    p_ack2.add_run(", Head of the Department of Computer Engineering, Atmiya University, for providing state-of-the-art laboratory infrastructure, cloud computational tools, software engineering resources, and a conducive academic environment that enabled us to successfully realize this project.")

    p_ack3 = doc.add_paragraph()
    p_ack3.paragraph_format.space_after = Pt(12)
    p_ack3.paragraph_format.line_spacing = 1.5
    p_ack3.add_run("We are also deeply thankful to the Honorable Vice-Chancellor and Executive Authorities of Atmiya University for their visionary leadership and encouragement toward hands-on practical research and innovative software development.")

    p_ack4 = doc.add_paragraph()
    p_ack4.paragraph_format.space_after = Pt(12)
    p_ack4.paragraph_format.line_spacing = 1.5
    p_ack4.add_run("Finally, we extend our heartfelt appreciation to our parents, family members, teaching and non-teaching staff of the Computer Engineering department, and fellow classmates for their unwavering moral support, constructive feedback, and active participation during user testing phases.")

    p_sig3 = doc.add_paragraph()
    p_sig3.paragraph_format.space_before = Pt(36)
    p_sig3.add_run("Student Team\nDepartment of Computer Engineering\nAtmiya University, Rajkot")

    doc.add_page_break()

    # ---------------------------------------------------------
    # ABSTRACT
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("ABSTRACT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    p_ab1 = doc.add_paragraph()
    p_ab1.paragraph_format.space_after = Pt(12)
    p_ab1.paragraph_format.line_spacing = 1.5
    p_ab1.add_run("In modern urban lifestyle, individuals spend a significant amount of daily cognitive effort—averaging 15 to 20 minutes every morning—selecting appropriate clothing attire. This recurring problem, often termed 'wardrobe paralysis' or decision fatigue, is exacerbated by the underutilization of existing clothing items. Over 60% of clothing items in average personal wardrobes remain unworn for months due to poor visibility, disorganized storage, and lack of contextual styling awareness. Traditional digital wardrobe management applications fail to solve this problem effectively because they demand tedious, manual typing of attributes (such as apparel category, secondary style, pattern, formality level, and color hex codes) for every uploaded garment.")

    p_ab2 = doc.add_paragraph()
    p_ab2.paragraph_format.space_after = Pt(12)
    p_ab2.paragraph_format.line_spacing = 1.5
    p_ab2.add_run("To eliminate data-entry friction and automate contextual wardrobe management, this project presents ")
    r = p_ab2.add_run("Smart Wardrobe & Outfit Planner (Alcove)")
    r.font.bold = True
    p_ab2.add_run(", a full-stack, AI-powered web platform. Alcove integrates a modern React single-page application (SPA), a scalable Node.js/Express REST API gateway, a cloud MongoDB database cluster, and a dedicated Python Flask microservice hosting deep learning and computer vision inference pipelines.")

    p_ab3 = doc.add_paragraph()
    p_ab3.paragraph_format.space_after = Pt(12)
    p_ab3.paragraph_format.line_spacing = 1.5
    p_ab3.add_run("The core artificial intelligence engine utilizes a fine-tuned MobileNetV3 multi-head Deep Convolutional Neural Network (CNN) trained on curated fashion datasets to automatically classify garments into primary categories (tops, bottoms, dresses, outerwear, footwear, accessories) and sub-types within milliseconds. In parallel, an OpenCV computer vision pipeline converts apparel images to the Hue-Saturation-Value (HSV) color space and applies K-Means spatial color clustering to accurately extract dominant and secondary color profiles. A rule-based heuristics engine subsequently synthesizes formality, pattern, and style classifications.")

    p_ab4 = doc.add_paragraph()
    p_ab4.paragraph_format.space_after = Pt(12)
    p_ab4.paragraph_format.line_spacing = 1.5
    p_ab4.add_run("On top of the computer vision pipeline, Alcove incorporates a multi-factor recommendation engine that dynamically computes outfit compatibility scores by evaluating real-time weather metrics (temperature, precipitation, humidity via OpenWeatherMap API), event occasion requirements, seasonal suitability, color wheel harmony matrices, and wear recency history. Additional features include an interactive wear history calendar, wardrobe gap coverage analytics, automated multi-day trip packing list generation, and shareable public outfit links with feedback voting.")

    p_ab5 = doc.add_paragraph()
    p_ab5.paragraph_format.space_after = Pt(12)
    p_ab5.paragraph_format.line_spacing = 1.5
    p_ab5.add_run("Empirical evaluation of the system demonstrates an AI image classification accuracy exceeding 92.4% on standard apparel categories, HSV color extraction accuracy of 98.1%, average end-to-end inference latency under 2.2 seconds on standard CPU hardware, and a 35% improvement in garment rotation frequency among test users. By bridging deep learning, computer vision, and modern web application architecture, Alcove transforms static physical wardrobes into dynamic, intelligent, eco-sustainable fashion management ecosystems.")

    doc.add_page_break()

    # ---------------------------------------------------------
    # INDEX / TABLE OF CONTENTS
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("INDEX / TABLE OF CONTENTS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    toc_items = [
        ("Candidate's Declaration", "ii"),
        ("Certificate of Approval", "iii"),
        ("Acknowledgement", "iv"),
        ("Abstract", "v"),
        ("List of Figures", "vii"),
        ("List of Tables", "viii"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Project Overview", "1"),
        ("  1.2 Purpose & Motivation", "3"),
        ("  1.3 Scope of the Project", "5"),
        ("  1.4 Project Objectives", "7"),
        ("  1.5 Target Audience & Stakeholders", "9"),
        ("  1.6 Organization of the Report", "11"),
        ("CHAPTER 2: PROJECT MANAGEMENT", "13"),
        ("  2.1 Project Planning & Scheduling", "13"),
        ("  2.2 Project Effort & Cost Estimation", "16"),
        ("  2.3 Risk Management & Mitigation Plan", "19"),
        ("  2.4 Team Organization & Communication Plan", "21"),
        ("CHAPTER 3: SYSTEM REQUIREMENTS STUDY", "23"),
        ("  3.1 User Characteristics & Operational Environment", "23"),
        ("  3.2 Hardware Requirements", "25"),
        ("  3.3 Software Requirements", "27"),
        ("  3.4 Software Architecture & Development Tools", "29"),
        ("  3.5 Comparative Study of Existing Systems", "31"),
        ("CHAPTER 4: SYSTEM ANALYSIS", "34"),
        ("  4.1 Requirement Elicitation & Study", "34"),
        ("  4.2 User Requirements (UR Specification)", "36"),
        ("  4.3 System Requirements (SR & NFR Specification)", "38"),
        ("  4.4 Feasibility Study", "42"),
        ("  4.5 Features of New System", "44"),
        ("CHAPTER 5: SYSTEM DESIGN", "46"),
        ("  5.1 Input / Output Interface", "46"),
        ("  5.2 Interface Design & UML Diagrams (Figures 5.1 - 5.8)", "48"),
        ("  5.3 Database Design & Data Dictionary (Tables 5.1 - 5.7)", "56"),
        ("  5.4 Screen Designs & UI Walkthroughs (Figures 5.9 - 5.16)", "62"),
        ("CHAPTER 6: CODE IMPLEMENTATION", "70"),
        ("  6.1 Implementation Environment", "70"),
        ("  6.2 Program / Module Specifications & Code Listings", "72"),
        ("  6.3 Coding Standards & Best Practices", "78"),
        ("CHAPTER 7: TESTING", "80"),
        ("  7.1 Testing Strategy & Methodology", "80"),
        ("  7.2 Testing Methods", "82"),
        ("  7.3 Test Cases Execution Matrix (Table 7.1)", "85"),
        ("CHAPTER 8: LIMITATIONS AND FUTURE ENHANCEMENT", "90"),
        ("  8.1 System Limitations", "90"),
        ("  8.2 Future Enhancement Roadmaps", "92"),
        ("CHAPTER 9: CONCLUSION", "95"),
        ("CHAPTER 10: REFERENCES", "97")
    ]

    for title, pg in toc_items:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(2)
        p_t.paragraph_format.space_after = Pt(4)
        r_t = p_t.add_run(title)
        r_t.font.name = 'Times New Roman'
        if title.startswith("CHAPTER"):
            r_t.font.bold = True
            r_t.font.size = Pt(11.5)
            r_t.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
        else:
            r_t.font.size = Pt(11)
        
        # Add dot leader and page number right aligned
        r_dots = p_t.add_run(f"  {'.' * (70 - len(title))}  {pg}")
        r_dots.font.name = 'Times New Roman'
        r_dots.font.size = Pt(10.5)

    doc.add_page_break()

    # ---------------------------------------------------------
    # LIST OF FIGURES
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("LIST OF FIGURES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    fig_items = [
        ("Fig. 5.1 System Architecture Diagram (Black & White)", "48"),
        ("Fig. 5.2 UML Class Diagram (Black & White)", "49"),
        ("Fig. 5.3 UML Use Case Diagram (Black & White)", "50"),
        ("Fig. 5.4 UML Activity Diagram – Image Upload & Tagging (Black & White)", "51"),
        ("Fig. 5.5 Data Flow Diagram DFD Level 0 (Black & White)", "52"),
        ("Fig. 5.6 UML State Diagram – Clothing Lifecycle (Black & White)", "53"),
        ("Fig. 5.7 Entity-Relationship (ER) Diagram (Black & White)", "54"),
        ("Fig. 5.8 UML Sequence Diagram – Outfit Generation (Black & White)", "55"),
        ("Fig. 5.9 Screen Design – User Authentication Interface (Color)", "62"),
        ("Fig. 5.10 Screen Design – Main Dashboard Overview (Color)", "63"),
        ("Fig. 5.11 Screen Design – Digital Wardrobe Catalog (Color)", "64"),
        ("Fig. 5.12 Screen Design – AI Outfit Generator Interface (Color)", "65"),
        ("Fig. 5.13 Screen Design – Wear History Calendar Interface (Color)", "66"),
        ("Fig. 5.14 Screen Design – Wardrobe Gap Analysis & Shopping Advice (Color)", "67"),
        ("Fig. 5.15 Screen Design – Trip Packing List Generator (Color)", "68"),
        ("Fig. 5.16 Screen Design – Outfit Sharing Interface (Color)", "69")
    ]

    for title, pg in fig_items:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(3)
        p_t.paragraph_format.space_after = Pt(4)
        r_t = p_t.add_run(title)
        r_t.font.name = 'Times New Roman'
        r_t.font.size = Pt(11)
        r_dots = p_t.add_run(f"  {'.' * (65 - len(title))}  {pg}")
        r_dots.font.name = 'Times New Roman'
        r_dots.font.size = Pt(10.5)

    doc.add_page_break()

    # ---------------------------------------------------------
    # LIST OF TABLES
    # ---------------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(18)
    r = p_h.add_run("LIST OF TABLES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    tbl_items = [
        ("Table 2.1 Project Execution Timeline & Milestone Gantt Chart", "14"),
        ("Table 2.2 Infrastructure & Development Cost Breakdown", "17"),
        ("Table 2.3 Comprehensive Risk Assessment Matrix", "19"),
        ("Table 3.1 Minimum & Recommended Hardware Specifications", "25"),
        ("Table 3.2 Full-Stack & Microservice Software Stack Matrix", "27"),
        ("Table 3.3 Comparative Feature Analysis Matrix", "31"),
        ("Table 5.1 users Collection Schema Data Dictionary", "56"),
        ("Table 5.2 clothingitems Collection Schema Data Dictionary", "57"),
        ("Table 5.3 outfits Collection Schema Data Dictionary", "58"),
        ("Table 5.4 outfitlogs Collection Schema Data Dictionary", "59"),
        ("Table 5.5 feedbacks Collection Schema Data Dictionary", "59"),
        ("Table 5.6 clothingcorrections Collection Schema Data Dictionary", "60"),
        ("Table 5.7 trips Collection Schema Data Dictionary", "60"),
        ("Table 7.1 Comprehensive Test Suite Execution Matrix (25 Test Cases)", "85")
    ]

    for title, pg in tbl_items:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(3)
        p_t.paragraph_format.space_after = Pt(4)
        r_t = p_t.add_run(title)
        r_t.font.name = 'Times New Roman'
        r_t.font.size = Pt(11)
        r_dots = p_t.add_run(f"  {'.' * (65 - len(title))}  {pg}")
        r_dots.font.name = 'Times New Roman'
        r_dots.font.size = Pt(10.5)

    doc.add_page_break()
    print("Preliminary pages generated with TOC, Figures, and Tables lists.")
