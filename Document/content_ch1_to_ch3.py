import docx
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx_helpers import add_styled_table

def add_chapter_1(doc):
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(18)
    p_h.paragraph_format.space_after = Pt(12)
    p_h.paragraph_format.keep_with_next = True
    r = p_h.add_run("CHAPTER – 1\nINTRODUCTION")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    # 1.1 Project Overview
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.1 Project Overview")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "In the contemporary digital era, personal lifestyle management applications have evolved rapidly from static informational utilities into ambient, intelligent decision-support systems. Among daily personal activities, wardrobe organization and clothing attire selection represent universal routines performed by millions of individuals around the globe every day. Despite major advances in smart home systems, wearable fitness monitors, and automated personal assistants, personal closet management has remained predominantly analog or dependent on informal mental recall. Physical closets often contain dozens or hundreds of clothing items, yet users struggle consistently to assemble cohesive, contextually appropriate outfits."
    )
    doc.add_paragraph(
        "Smart Wardrobe & Outfit Planner (codenamed Alcove) is an advanced, full-stack digital fashion management platform engineered to solve these challenges. Alcove seamlessly bridges physical clothing assets with cloud-based artificial intelligence microservices. By capturing a simple smartphone photo of any apparel item, users can instantly digitize their wardrobe without manual typing friction. The system executes automated image background removal, PyTorch deep learning classification (MobileNetV3 backbone), OpenCV Hue-Saturation-Value (HSV) spatial color extraction, and rule-based style tagging within milliseconds."
    )
    doc.add_paragraph(
        "Beyond digital cataloging, Alcove provides an intelligent multi-factor recommendation engine. When a user requests outfit suggestions, the platform evaluates live meteorological parameters (temperature, precipitation risk, humidity level via OpenWeatherMap API), selected event occasions (e.g., formal office work, casual weekend brunch, outdoor sports, evening party), color wheel harmony principles, and individual wear recency history. The application also provides an interactive wear history calendar, automated wardrobe gap analysis with smart shopping recommendations, multi-day trip packing list optimization, and shareable public outfit links."
    )
    doc.add_paragraph(
        "The overall system architecture is organized around modern decoupled microservice principles. A responsive single page application (SPA) built using React.js 18, Vite 5, and Tailwind CSS 3 serves as the user-facing client interface. The backend consists of a scalable Node.js / Express.js REST API gateway listening on HTTP port 5000, connected to a cloud MongoDB Atlas database cluster. Heavy artificial intelligence and computer vision computational workloads are offloaded to a dedicated Python 3.10 Flask microservice listening on HTTP port 8000. This separation of concerns ensures optimal system performance, clean maintainability, and horizontal scalability."
    )

    # 1.2 Purpose / Motivation
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.2 Purpose & Motivation")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The primary motivation for developing Alcove stems from three critical real-world challenges observed in contemporary fashion and lifestyle habits:"
    )
    doc.add_paragraph(
        "1. Daily Cognitive Load and Decision Fatigue: Studies in behavioral psychology indicate that everyday individuals make over 35,000 decisions daily. Selecting morning attire accounts for 15 to 20 minutes of repetitive decision-making effort every day—accumulating to over 100 hours per year. This phenomenon, widely recognized as 'wardrobe paralysis,' leads to stress, morning delays, and suboptimal outfit choices. By automating context-aware outfit selection, Alcove reduces morning decision fatigue significantly."
    )
    doc.add_paragraph(
        "2. Low Garment Rotation and Eco-Sustainability: The global fashion industry contributes approximately 8% to 10% of worldwide greenhouse gas emissions and consumes vast water resources. Fast fashion consumption patterns have led to oversized personal closets where over 60% of garments remain unworn for extended periods. Most people repeatedly wear a small fraction (less than 20%) of their total wardrobe simply because unorganized physical closets conceal hidden items. Alcove promotes circular fashion and sustainable living by bringing full visibility to forgotten garments and encouraging balanced item rotation using historical wear recency tracking."
    )
    doc.add_paragraph(
        "3. High Friction in Existing Digital Wardrobe Applications: Prior mobile apps in the wardrobe management space failed to achieve widespread long-term adoption because they required users to manually type category names, select color swatches, enter fabric details, and specify season tags for every uploaded photograph. Entering attributes for a 100-item wardrobe manually takes several hours of painstaking typing. Alcove overcomes this critical barrier by employing automated computer vision inference that populates all item metadata in under 3 seconds per image."
    )

    # 1.3 Scope of the Project
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.3 Scope of the Project")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The operational scope of the Smart Wardrobe & Outfit Planner encompasses full-stack software architecture, computer vision model deployment, REST API development, database persistence, and user interface design. The boundaries of the project are explicitly defined as follows:"
    )
    doc.add_paragraph("A. Functional Scope (In-Scope Features):")
    doc.add_paragraph("• Single-Click Image Upload & Digitization: Supports JPG/PNG image uploads, file MIME validation, secure multi-user storage using Node.js Multer middleware.")
    doc.add_paragraph("• Automated AI Classification & Tagging: Deep learning inference using MobileNetV3 CNN for category (top, bottom, dress, footwear, outerwear, accessory) and sub-category prediction.")
    doc.add_paragraph("• OpenCV Color Extraction Engine: Color space conversion to HSV and K-means spatial clustering to identify dominant and secondary color hex codes and color names.")
    doc.add_paragraph("• Multi-Attribute Recommendation Engine: Algorithmic scoring combining weather temperature/conditions, target occasion, color wheel complementation, style consistency, and wear recency.")
    doc.add_paragraph("• Wear History Calendar & Frequency Analytics: Date-based outfit wear logging, visual calendar interface, item wear counters, and cost-per-wear metrics.")
    doc.add_paragraph("• Wardrobe Gap Analysis & Shopping Advice: Target category coverage ratio calculation, under-represented category alerts, and targeted purchasing suggestions.")
    doc.add_paragraph("• Trip Packing List Generator: Itinerary date and location input, weather forecast integration, minimal packing list compilation, and interactive packing checklist.")
    doc.add_paragraph("• Guest Outfit Sharing & Public Voting: Generation of unique UUID outfit URLs allowing guest users to view outfits and submit feedback votes.")
    
    doc.add_paragraph("B. Technical & Architectural Scope:")
    doc.add_paragraph("• Web-based Responsive Single Page Application (SPA) built using React.js 18, Vite 5, and Tailwind CSS 3 with custom glassmorphism design tokens.")
    doc.add_paragraph("• Node.js / Express REST API backend server listening on HTTP port 5000 with JWT authentication, rate limiting, and Mongoose ODM database connection.")
    doc.add_paragraph("• Python 3.10 Flask microservice listening on HTTP port 8000 for PyTorch and OpenCV computational model execution.")
    doc.add_paragraph("• MongoDB Atlas cloud database cluster hosting normalized document collections for users, clothing items, outfits, logs, feedbacks, corrections, and trips.")

    doc.add_paragraph("C. Out-of-Scope Boundaries:")
    doc.add_paragraph("• Physical hardware installation (e.g., RFID tags, smart mirror display hardware, automated motorized closet racks).")
    doc.add_paragraph("• Direct commercial e-commerce checkout payment gateway integration (e.g., Stripe/Razorpay purchasing).")
    doc.add_paragraph("• 3D human body mesh reconstruction and photorealistic avatar rendering.")

    # 1.4 Objectives
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.4 Project Objectives")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "To ensure rigorous software engineering standards and quantifiable system validation, the project establishes five specific, measurable, achievable, relevant, and time-bound (SMART) objectives:"
    )
    doc.add_paragraph("1. Objective 1 (Latency Reduction): Reduce daily outfit selection time from an average of 15 minutes to under 5 seconds by delivering pre-scored context-matched recommendations.")
    doc.add_paragraph("2. Objective 2 (Classification Accuracy): Achieve an automated image classification accuracy exceeding 90% across primary clothing categories using PyTorch MobileNetV3 transfer learning.")
    doc.add_paragraph("3. Objective 3 (Explainable Color Tagging): Automate dominant and secondary color profile extraction with 100% explainability using OpenCV HSV K-means clustering.")
    doc.add_paragraph("4. Objective 4 (Garment Rotation Enhancement): Increase overall wardrobe garment rotation frequency by at least 35% through recency penalty factors built into the recommendation algorithm.")
    doc.add_paragraph("5. Objective 5 (Travel Packing Efficiency): Minimize travel packing item volume by at least 25% by generating multi-use outfit combination packing lists synchronized with destination weather.")

    # 1.5 Target Audience & Stakeholders
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.5 Target Audience & Stakeholders")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The target user base and primary stakeholders of Alcove are categorized into four distinct user personas:"
    )
    doc.add_paragraph("• Persona 1: Working Professionals & Students—Individuals with busy schedules who require quick, daily occasion-matched outfit choices without wasting morning time.")
    doc.add_paragraph("• Persona 2: Sustainable Fashion Advocates—Conscious consumers who wish to maximize the utility of existing garments, reduce duplicate clothing purchases, and embrace minimal lifestyle habits.")
    doc.add_paragraph("• Persona 3: Frequent Travelers & Business Commuters—Users who travel regularly for work or leisure and require optimized, lightweight packing checklists tailored to destination weather.")
    doc.add_paragraph("• Persona 4: Personal Stylists & Wardrobe Consultants—Fashion professionals seeking digital tools to review client closets, suggest coordinated outfits, and track client wear history.")

    # 1.6 Organization of the Report
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("1.6 Organization of the Report")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph("This project report is organized into ten comprehensive chapters detailing the full engineering lifecycle of Alcove:")
    doc.add_paragraph("• Chapter 1: Introduction—Presents the project background, purpose, scope, SMART objectives, stakeholder personas, and report sitemap.")
    doc.add_paragraph("• Chapter 2: Project Management—Covers project scheduling, Work Breakdown Structure (WBS), COCOMO effort/cost estimation, risk mitigation matrix, and team roles.")
    doc.add_paragraph("• Chapter 3: System Requirements Study—Details user characteristics, minimum/recommended hardware/software specifications, technology stack selections, and comparative competitor study.")
    doc.add_paragraph("• Chapter 4: System Analysis—Elaborates on requirement elicitation, user requirements (UR), functional/non-functional system requirements (SR/NFR), four-way feasibility study, and feature breakdown.")
    doc.add_paragraph("• Chapter 5: System Design—Presents input/output specifications, complete black & white UML/DFD/ER diagrams (Figures 5.1 to 5.8), MongoDB data dictionaries, and color screen interface designs (Figures 5.9 to 5.16).")
    doc.add_paragraph("• Chapter 6: Code Implementation—Provides environment stack configs, core source code snippets for AI Flask microservice, OpenCV color detector, recommendation scoring engine, Express REST API, React UI, and coding standards.")
    doc.add_paragraph("• Chapter 7: Testing—Outlines the multi-tier STLC testing strategy, unit/integration/validation/performance testing methods, and a comprehensive matrix of 25 formal test cases.")
    doc.add_paragraph("• Chapter 8: Limitations & Future Enhancements—Discusses current technical limitations and outlines five major future feature roadmaps.")
    doc.add_paragraph("• Chapter 9: Conclusion—Summarizes system achievements, engineering performance, and practical contributions to sustainable fashion.")
    doc.add_paragraph("• Chapter 10: References—Lists academic publications, IEEE papers, official framework documentation, and textbook citations.")

    doc.add_page_break()
    print("Chapter 1 added.")


def add_chapter_2(doc):
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(18)
    p_h.paragraph_format.space_after = Pt(12)
    p_h.paragraph_format.keep_with_next = True
    r = p_h.add_run("CHAPTER – 2\nPROJECT MANAGEMENT")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    # 2.1 Project Planning & Scheduling
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("2.1 Project Planning & Scheduling")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "Effective software engineering requires disciplined project planning, milestone tracking, and task breakdown. The development of Alcove was executed across an 8-week sprint timeline following an Agile Scrum methodology. The project lifecycle was partitioned into six primary phases:"
    )
    doc.add_paragraph("1. Phase 1: Requirements Elicitation & Domain Study (Week 1)")
    doc.add_paragraph("2. Phase 2: System Architecture & Database Schema Design (Week 2)")
    doc.add_paragraph("3. Phase 3: AI Engine Model Training & OpenCV Pipeline Setup (Weeks 3–4)")
    doc.add_paragraph("4. Phase 4: Express REST API & Database Services Development (Weeks 4–5)")
    doc.add_paragraph("5. Phase 5: React SPA Frontend Development & Integration (Weeks 6–7)")
    doc.add_paragraph("6. Phase 6: System Testing, Verification, Bug Fixing & Report Documentation (Week 8)")

    doc.add_paragraph("Table 2.1 details the project execution timeline, milestone allocations, and deliverables across the 8-week schedule:")

    # Table 2.1
    headers_t21 = ["Phase", "Task / Milestone Description", "Duration", "Week", "Responsible Role", "Key Deliverable"]
    data_t21 = [
        ["Phase 1", "Requirement Elicitation, User Interviews & Feasibility Study", "5 Days", "Week 1", "Project Lead / BA", "SRS Document"],
        ["Phase 2", "System Architecture Design, UML Diagrams & DB Schema", "5 Days", "Week 2", "System Architect", "Architecture Spec & DFDs"],
        ["Phase 3", "Dataset Preprocessing, MobileNetV3 Training & OpenCV Setup", "10 Days", "Weeks 3-4", "AI/ML Engineer", "Trained .pth & Flask API"],
        ["Phase 4", "Express REST Controllers, Auth Middleware & Services", "10 Days", "Weeks 4-5", "Backend Developer", "Node.js Server & Routes"],
        ["Phase 5", "React SPA Development, UI Styling & API Integration", "10 Days", "Weeks 6-7", "Frontend Developer", "Interactive React App"],
        ["Phase 6", "End-to-End Testing, Bug Fixes & Project Documentation", "5 Days", "Week 8", "QA Engineer / All", "Test Report & Final Docx"]
    ]
    add_styled_table(doc, headers_t21, data_t21, [0.8, 2.2, 0.8, 0.8, 1.2, 1.4])

    # 2.2 Project Effort & Cost Estimation
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("2.2 Project Effort & Cost Estimation")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "To quantify project effort and resource allocation, the Constructive Cost Model (COCOMO Intermediate Model) was applied based on Thousands of Delivered Source Lines of Code (KLOC). The code volume across system modules was evaluated as follows:"
    )
    doc.add_paragraph("• Frontend React Components, JSX & Styling: ~4,200 Lines of Code (4.2 KLOC)")
    doc.add_paragraph("• Backend Express REST API Controllers & Middleware: ~3,100 Lines of Code (3.1 KLOC)")
    doc.add_paragraph("• Python AI Microservice, PyTorch Classifier & OpenCV Engine: ~2,300 Lines of Code (2.3 KLOC)")
    doc.add_paragraph("• Total Project Software Size (KLOC): ~9.6 KLOC")

    doc.add_paragraph(
        "Applying the Organic Mode COCOMO equations (E = a * (KLOC)^b and T_dev = c * (E)^d with constants a = 2.4, b = 1.05, c = 2.5, d = 0.38):"
    )
    doc.add_paragraph("• Nominal Effort Calculation: E = 2.4 * (9.6)^1.05 = 25.96 Person-Months (unadjusted macro baseline).")
    doc.add_paragraph("• Adjusted Academic Sprint Effort: Factoring reusable open-source framework libraries (React, Express, PyTorch, OpenCV), the adjusted project effort equates to approximately 3.2 Person-Months executed by a multi-role student team across 8 calendar weeks.")
    doc.add_paragraph("• Development Duration Calculation: T_dev = 2.5 * (3.2)^0.38 = 3.89 Calendar Months (scaled down to an intensive 2-month academic sprint).")

    doc.add_paragraph("Table 2.2 outlines the development and infrastructure cost breakdown for the Alcove platform:")

    headers_t22 = ["Resource Category", "Item Description", "Quantity / Usage", "Cost (INR / USD)", "Funding Status"]
    data_t22 = [
        ["Hardware Server", "Intel Core i7 Workstation (16GB RAM, CPU Inference)", "1 Unit", "₹0 (Existing Lab)", "University Infrastructure"],
        ["Cloud Database", "MongoDB Atlas M0 Shared Cluster (512MB Storage)", "Cloud Instance", "₹0 (Free Tier)", "Open-Source Community"],
        ["Third-Party API", "OpenWeatherMap Current Weather REST API", "1,000 calls/day", "₹0 (Free Tier)", "Developer Account"],
        ["Development IDE", "Visual Studio Code, Git, GitHub Repository", "4 Licenses", "₹0 (Open Source)", "Free License"],
        ["Software Libraries", "React, Node.js, PyTorch, OpenCV, Express, Vite", "Open Source", "₹0 (MIT/BSD)", "Community License"],
        ["Total Estimated Cost", "Complete Development Infrastructure", "Full Project", "₹0.00 (Zero INR)", "Fully Open Source"]
    ]
    add_styled_table(doc, headers_t22, data_t22, [1.4, 2.2, 1.2, 1.2, 1.2])

    # 2.3 Risk Management
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("2.3 Risk Management & Mitigation Plan")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "Risk management involves identifying potential technical, operational, and schedule bottlenecks prior to project execution and establishing proactive mitigation strategies. Table 2.3 summarizes the primary risk factors evaluated for Alcove:"
    )

    headers_t23 = ["Risk ID", "Risk Description", "Category", "Probability", "Impact", "Mitigation Strategy"]
    data_t23 = [
        ["RSK-01", "AI Inference Latency on CPU Host", "Technical", "Medium", "High", "Optimize PyTorch tensor operations; resize images to 224x224 before CNN pass."],
        ["RSK-02", "HSV Color Inaccuracy under Shadow/Lighting", "Technical", "High", "Medium", "Implement K-means spatial thresholding and allow manual UI color confirmation."],
        ["RSK-03", "OpenWeatherMap API Rate Limit Exhaustion", "Operational", "Low", "Medium", "Implement backend memory caching for weather responses per zip code (1h TTL)."],
        ["RSK-04", "MongoDB Connection Timeout during Bulk Uploads", "Technical", "Low", "High", "Configure retryable writes and Mongoose connection pool maxPoolSize=10."],
        ["RSK-05", "Scope Creep & Development Schedule Delay", "Schedule", "Medium", "High", "Strictly enforce sprint milestone deliverables and feature freezing by Week 6."]
    ]
    add_styled_table(doc, headers_t23, data_t23, [0.8, 1.8, 1.0, 0.9, 0.8, 1.9])

    # 2.4 Team Organization
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("2.4 Team Organization & Communication Plan")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The project was executed by a collaborative student engineering team under faculty supervision. Role division and communication protocols were established as follows:"
    )
    doc.add_paragraph("• AI & Machine Learning Lead: Responsible for dataset preprocessing, MobileNetV3 PyTorch model fine-tuning, OpenCV HSV color clustering scripts, and Flask API microservice deployment.")
    doc.add_paragraph("• Backend & Database Engineer: Responsible for Node.js / Express server architecture, JWT authentication middleware, Mongoose database schemas, recommendation scoring algorithms, and REST routes.")
    doc.add_paragraph("• Frontend UI/UX Developer: Responsible for React component hierarchy, Vite build configuration, Tailwind CSS glassmorphism styling, API integrations, and responsive layouts.")
    doc.add_paragraph("• Quality Assurance & Technical Documentation Specialist: Responsible for unit/integration test case execution, Postman API collection verification, bug tracking, and master report preparation.")
    doc.add_paragraph("• Communication & Version Control Protocols: GitHub feature-branch workflow (main, dev, feature/* branches), daily 15-minute Scrum standups, and bi-weekly review meetings with Faculty Guide Mr. Birju Tank.")

    doc.add_page_break()
    print("Chapter 2 added.")


def add_chapter_3(doc):
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(18)
    p_h.paragraph_format.space_after = Pt(12)
    p_h.paragraph_format.keep_with_next = True
    r = p_h.add_run("CHAPTER – 3\nSYSTEM REQUIREMENTS STUDY")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    # 3.1 User Characteristics & Operational Environment
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("3.1 User Characteristics & Operational Environment")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "Alcove is designed to serve a broad spectrum of end users ranging from everyday consumers to professional wardrobe consultants. The operational environment and user characteristics are defined below:"
    )
    doc.add_paragraph("• User Technical Proficiency: Minimal technical background required. End users need basic familiarity operating web browsers on desktop or mobile devices and capturing digital photographs.")
    doc.add_paragraph("• Operational Client Environment: Modern HTML5 and JavaScript (ES6+) compliant web browsers including Google Chrome 110+, Mozilla Firefox 110+, Apple Safari 16+, and Microsoft Edge 110+. No external browser plugins or software downloads are required.")
    doc.add_paragraph("• Server Deployment Environment: Cross-platform Node.js v18.x LTS runtime and Python 3.10 runtime hosted on Linux (Ubuntu 22.04 LTS) or Windows Server operating environments.")

    # 3.2 Hardware Requirements
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("3.2 Hardware Requirements")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "To ensure optimal computational performance during image classification and microservice API communication, the minimum and recommended hardware configurations are defined in Table 3.1:"
    )

    headers_t31 = ["Hardware Component", "Minimum Server Requirement", "Recommended Server Requirement", "Client Device Minimum"]
    data_t31 = [
        ["Processor (CPU)", "Dual-Core 2.0 GHz x86-64", "Quad-Core Intel i7 / AMD Ryzen 7 3.0 GHz", "Single-Core 1.5 GHz Mobile/Desktop"],
        ["System Memory (RAM)", "4 GB DDR4 RAM", "16 GB DDR4 RAM", "2 GB RAM"],
        ["Storage Space", "10 GB Available HDD/SSD", "50 GB High-Speed NVMe SSD", "500 MB Available Browser Storage"],
        ["Network Bandwidth", "10 Mbps Broadband Internet", "100 Mbps Dedicated Fiber Line", "3G / 4G / 5G / Wi-Fi Connection"],
        ["Camera Device", "N/A (Server)", "N/A (Server)", "5 MP Integrated Smartphone / Webcam"]
    ]
    add_styled_table(doc, headers_t31, data_t31, [1.4, 1.8, 2.0, 2.0])

    # 3.3 Software Requirements
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("3.3 Software Requirements")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The software architecture relies entirely on robust, industry-standard, open-source frameworks. Table 3.2 details the technology stack matrix across system layers:"
    )

    headers_t32 = ["System Layer", "Technology / Framework", "Version", "Role / Purpose", "Selection Rationale"]
    data_t32 = [
        ["Frontend UI", "React.js + Vite", "React 18 / Vite 5", "Single Page Application (SPA)", "Fast Virtual DOM rendering & modern build tooling"],
        ["CSS Styling", "Tailwind CSS + Custom Utility", "Tailwind v3", "Glassmorphism UI System", "Utility-first responsive styling & zero runtime overhead"],
        ["Backend API Gateway", "Node.js + Express.js", "Node 18 / Express 4", "REST API & Auth Services", "Asynchronous non-blocking I/O & fast HTTP throughput"],
        ["Database System", "MongoDB + Mongoose ODM", "MongoDB 6.0 / Mongoose 7", "Document Persistence", "Flexible JSON schema for dynamic clothing attributes"],
        ["AI Microservice", "Python + Flask", "Python 3.10 / Flask 2.3", "Deep Learning API Server", "Native PyTorch & OpenCV library support"],
        ["AI Backbone", "PyTorch (MobileNetV3)", "PyTorch 2.0", "Garment Multi-Class CNN", "Lightweight CPU inference with high classification accuracy"],
        ["Computer Vision", "OpenCV Python", "OpenCV 4.8", "HSV Color K-Means Clustering", "Deterministic, explainable spatial color extraction"]
    ]
    add_styled_table(doc, headers_t32, data_t32, [1.1, 1.4, 0.9, 1.8, 2.0])

    # 3.4 Software Architecture & Development Tools
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("3.4 Software Architecture & Development Tools")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The application development lifecycle utilized modern developer tooling to ensure clean code structure, version control, and API testing:"
    )
    doc.add_paragraph("• Integrated Development Environment (IDE): Visual Studio Code v1.85 with ESLint, Prettier, Python PEP8, and Tailwind IntelliSense extensions.")
    doc.add_paragraph("• API Testing & Verification: Postman v10.18 for testing Node.js REST endpoints and Flask prediction routes with JSON payloads.")
    doc.add_paragraph("• Package Managers & Bundlers: Node Package Manager (NPM v9.x) for frontend/backend dependencies and Vite 5 for lightning-fast frontend hot module replacement (HMR).")
    doc.add_paragraph("• Version Control & Collaboration: Git v2.40 for local commit management and GitHub cloud repositories for remote code backup and branch integration.")

    # 3.5 Comparative Study of Existing Systems
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("3.5 Comparative Study of Existing Systems")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "To establish the novelty and technical superiority of Alcove, a detailed comparative analysis was conducted against traditional closet organization methods and commercial mobile wardrobe applications (e.g., Stylebook, Acloset, Whering, Cladwell). Table 3.3 summarizes this feature evaluation:"
    )

    headers_t33 = ["Feature / Capability", "Physical Closet Memory", "Traditional Apps (Stylebook/Acloset)", "Alcove Smart Wardrobe (Proposed System)"]
    data_t33 = [
        ["Garment Digitization", "None (Physical storage)", "Manual photography + manual form entry", "Automated single-click photo upload with AI background removal"],
        ["Category Classification", "Mental recall", "Manual dropdown selection", "Automated MobileNetV3 CNN multi-class prediction (>92% accuracy)"],
        ["Color Extraction", "Visual observation", "Manual color swatch picking", "Automated OpenCV K-Means spatial color detection in HSV space"],
        ["Outfit Recommendation", "Trial and error", "Basic static rules or manual collation", "Multi-factor algorithm scoring weather, occasion, color harmony & recency"],
        ["Weather Sync", "Manual weather check", "Limited or static temperature input", "Automated real-time OpenWeatherMap API integration"],
        ["Wear History Tracking", "Forgotten", "Basic manual log entries", "Interactive wear calendar with item rotation counters & cost-per-wear"],
        ["Gap Analysis", "None", "Static item counts", "Automated category coverage ratio evaluation & shopping recommendations"],
        ["Trip Packing Optimizer", "Manual suitcase packing", "Static checklists", "Automated weather-aligned minimal packing list generator"],
        ["Outfit Sharing", "Physical feedback", "In-app social feed only", "Public guest URL generation with live feedback voting"],
        ["Architecture & Cost", "N/A", "Proprietary paid subscription apps", "Decoupled REST microservice architecture, 100% open-source stack"]
    ]
    add_styled_table(doc, headers_t33, data_t33, [1.4, 1.6, 2.0, 2.2])

    doc.add_page_break()
    print("Chapter 3 added.")
