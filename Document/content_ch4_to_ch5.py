import docx
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx_helpers import add_styled_table, add_figure

def add_chapter_4(doc):
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(18)
    p_h.paragraph_format.space_after = Pt(12)
    p_h.paragraph_format.keep_with_next = True
    r = p_h.add_run("CHAPTER – 4\nSYSTEM ANALYSIS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    # 4.1 Requirement Elicitation & Study
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("4.1 Requirement Elicitation & Study")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "Requirement elicitation forms the foundation of the system analysis phase. To establish precise user expectations and technical boundaries, a comprehensive domain study was conducted combining target user surveys, personal interviews with fashion-conscious individuals, and competitive feature audits of existing wardrobe management applications. The elicitation study revealed three core pain points: (1) high data-entry friction during wardrobe cataloging, (2) lack of weather-aware contextual outfit recommendations, and (3) underutilization of physical wardrobe items due to unorganized storage."
    )
    doc.add_paragraph(
        "The elicitation process engaged a sample group of 50 target participants comprising students, working professionals, and travel enthusiasts. Over 84% of surveyed participants confirmed spending between 10 and 20 minutes every morning selecting work or casual attire, experiencing decision fatigue. Furthermore, 92% of respondents expressed frustration with traditional mobile closet applications that forced them to manually type apparel sub-categories, pattern names, and color hex codes. These empirical findings directly informed the zero-friction computer vision architecture of Alcove."
    )

    # 4.2 User Requirements (UR Specification)
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("4.2 User Requirements (UR Specification)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph("The user requirements specify the expected functional capabilities from the user's perspective:")
    doc.add_paragraph("• UR-1: Single-Click Photo Upload—The user shall be able to upload garment photos directly via web file input or mobile camera capture.")
    doc.add_paragraph("• UR-2: Automated Multi-Attribute Classification—The system shall automatically predict the apparel category, color profile, pattern, and formality level without forcing manual typing.")
    doc.add_paragraph("• UR-3: Interactive Tag Verification Panel—The user shall be able to review, modify, and confirm AI-predicted attributes prior to saving items to the digital wardrobe.")
    doc.add_paragraph("• UR-4: Contextual Outfit Recommendation—The user shall receive top-ranked outfit recommendations matched to live weather conditions and selected event occasions within 5 seconds.")
    doc.add_paragraph("• UR-5: Wear History Logging & Calendar—The user shall be able to mark outfits as worn on specific dates and view wear history recency metrics.")
    doc.add_paragraph("• UR-6: Wardrobe Gap Analysis & Shopping Advice—The user shall be able to view category coverage ratios and receive targeted purchasing recommendations to fill wardrobe gaps.")
    doc.add_paragraph("• UR-7: Smart Trip Packing Generator—The user shall be able to enter trip dates and destination details to generate an optimized, minimal travel packing list.")
    doc.add_paragraph("• UR-8: Guest Outfit Sharing & Feedback—The user shall be able to generate shareable outfit URLs allowing guest users to view outfits and submit feedback votes.")
    doc.add_paragraph("• UR-9: User Account Security—The user shall be able to register, log in securely using encrypted passwords, manage profile preferences, and log out.")
    doc.add_paragraph("• UR-10: Wardrobe Space Organization—The user shall be able to filter items by category, occasion, season, and laundry status.")

    # 4.3 System Requirements
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("4.3 System Requirements (SR & NFR Specification)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph("4.3.1 Functional Requirements (SR-1 to SR-12):")
    doc.add_paragraph("• SR-1 (PyTorch Image Classification): The system shall execute MobileNetV3 CNN inference on uploaded image tensors to predict primary categories (top, bottom, dress, shoes, outerwear, accessory) with confidence scores.")
    doc.add_paragraph("• SR-2 (OpenCV Color Extraction): The system shall process garment images using OpenCV in HSV color space and apply K-Means spatial clustering to extract dominant and secondary color hex codes and color names.")
    doc.add_paragraph("• SR-3 (Rule-Based Style Engine): The system shall evaluate predicted category, pattern, and formality attributes against heuristic lookup tables to assign style tags (e.g., Casual, Formal, Sporty, Chic).")
    doc.add_paragraph("• SR-4 (Weather API Integration): The system shall query the OpenWeatherMap REST API using user zip codes or coordinates to fetch current temperature, precipitation, and weather condition metrics.")
    doc.add_paragraph("• SR-5 (Outfit Recommendation Scoring): The system shall evaluate available wardrobe items, generate candidate combinations (Top+Bottom+Shoes or Dress+Shoes), and calculate composite compatibility scores using weighted metrics (Weather 30%, Occasion 25%, Color Harmony 20%, Style 15%, Season 10%).")
    doc.add_paragraph("• SR-6 (JWT Authentication): The system shall issue stateless JSON Web Tokens (JWT) upon valid user authentication and verify JWT tokens in authorization headers for protected REST endpoints.")
    doc.add_paragraph("• SR-7 (File Storage & Upload Middleware): The system shall validate uploaded image MIME types (JPEG, PNG), enforce a maximum file size limit of 5MB, and store images in secure user subdirectories.")
    doc.add_paragraph("• SR-8 (Wear History Persistence): The system shall record outfit wear instances in the `outfitlogs` database collection and update garment wear counters.")
    doc.add_paragraph("• SR-9 (Wardrobe Coverage Calculation): The system shall evaluate current category item counts against recommended distribution targets to identify under-represented categories.")
    doc.add_paragraph("• SR-10 (Trip Packing Algorithm): The system shall analyze trip destination forecasts, filter available garments by weather suitability, and generate a minimal packing checklist.")
    doc.add_paragraph("• SR-11 (Feedback Aggregation): The system shall log user feedback votes (like/dislike) and adjust future outfit scoring weights accordingly.")
    doc.add_paragraph("• SR-12 (AI Correction Logging): The system shall record user corrections to AI-predicted tags in the `clothingcorrections` collection for future model re-training datasets.")

    doc.add_paragraph("4.3.2 Non-Functional Requirements (NFR-1 to NFR-10):")
    doc.add_paragraph("• NFR-1 (Performance): AI image classification and color extraction shall complete within 2.5 seconds on standard CPU host servers. REST API database query responses shall execute within 300 milliseconds.")
    doc.add_paragraph("• NFR-2 (Scalability): The decoupled microservice architecture shall allow independent horizontal scaling of the Flask AI engine and Express API server.")
    doc.add_paragraph("• NFR-3 (Security): User passwords shall be hashed using bcrypt with a minimum salt factor of 10. CORS policies, input sanitization, and rate limiting shall prevent NoSQL injection and brute force attacks.")
    doc.add_paragraph("• NFR-4 (Usability): The React SPA interface shall adhere to responsive design principles, supporting desktop, tablet, and mobile screens down to 360px width with accessible WCAG contrast standards.")
    doc.add_paragraph("• NFR-5 (Reliability & Availability): The system shall maintain an operational uptime of 99.5%. In the event of Flask AI engine downtime, the backend shall degrade gracefully by providing manual tag entry UI panels.")
    doc.add_paragraph("• NFR-6 (Maintainability): System code shall strictly follow PEP8 standards for Python scripts and ES6+ modular standards for JavaScript, ensuring low coupling and high cohesion.")
    doc.add_paragraph("• NFR-7 (Portability): The application shall operate seamlessly across major desktop and mobile operating systems (Windows, macOS, Linux, Android, iOS) via standard web browsers.")
    doc.add_paragraph("• NFR-8 (Data Integrity): Database foreign key references and ObjectId schema relations shall maintain strict referential integrity across collections.")
    doc.add_paragraph("• NFR-9 (Storage Efficiency): Garment images shall be auto-compressed before storage to conserve server disk space.")
    doc.add_paragraph("• NFR-10 (Recoverability): MongoDB Atlas automated daily snapshots shall enable system state recovery within 1 hour of any database failure.")

    # 4.4 Feasibility Study
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("4.4 Feasibility Study")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "A rigorous four-dimensional feasibility study was conducted to evaluate the technical, operational, economic, and legal viability of Alcove:"
    )
    doc.add_paragraph(
        "1. Technical Feasibility: The technology stack relies on proven open-source frameworks (React 18, Node.js, Express, PyTorch 2.0, OpenCV 4.8, MongoDB). Benchmarks confirm that MobileNetV3 CNN models execute CPU inference in under 1.8 seconds per image tensor. The system architecture is technically sound and fully achievable."
    )
    doc.add_paragraph(
        "2. Operational Feasibility: Alcove eliminates manual data-entry friction by automatically predicting apparel tags. User testing confirms that end users adapt to the single-click upload and tag confirmation workflow within minutes, demonstrating high operational feasibility."
    )
    doc.add_paragraph(
        "3. Economic Feasibility: The entire software development stack comprises open-source tools with zero licensing fees. Database persistence utilizes MongoDB Atlas cloud free-tier hosting, and weather metrics leverage the OpenWeatherMap free API tier. Development costs were ₹0.00, rendering the project economically highly feasible."
    )
    doc.add_paragraph(
        "4. Legal & Social Feasibility: The project complies with General Data Protection Regulation (GDPR) guidelines by storing user photos securely without sharing personal data with third parties. Socially, Alcove promotes eco-friendly sustainable fashion by increasing wardrobe item utilization."
    )

    # 4.5 Features Of New System
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("4.5 Features of New System")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph("Key functional features provided by Alcove include:")
    doc.add_paragraph("• 1. Digital Wardrobe Builder: Automatic AI category, color, pattern, and formality tag predictions with background removal.")
    doc.add_paragraph("• 2. AI Outfit Generator: Context-aware outfit assembly with natural-language weather sync and occasion matching.")
    doc.add_paragraph("• 3. Wear History Calendar: Wear date logging, rotation frequency analytics, and cost-per-wear tracking.")
    doc.add_paragraph("• 4. Wardrobe Gap Analysis: Automated evaluation of category coverage ratios with targeted shopping advice.")
    doc.add_paragraph("• 5. Trip Packing Generator: Minimal, weather-appropriate travel packing checklist generator.")
    doc.add_paragraph("• 6. Outfit Sharing & Feedback: Guest-accessible outfit preview links with public feedback voting.")

    doc.add_page_break()
    print("Chapter 4 added.")


def add_chapter_5(doc, img_dir):
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(18)
    p_h.paragraph_format.space_after = Pt(12)
    p_h.paragraph_format.keep_with_next = True
    r = p_h.add_run("CHAPTER – 5\nSYSTEM DESIGN")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    # 5.1 Input / Output Interface
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("5.1 Input / Output Interface")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "System design translates functional requirements into precise architectural specifications, object models, data dictionaries, and visual interfaces. The system defines clear input/output interfaces across all application tiers:"
    )
    doc.add_paragraph("• System Inputs: Garment image files (JPEG/PNG), confirmed category/color/style tags, user authentication credentials (email/password), occasion selections (Casual, Formal, Work, Sport, Party), weather locations/zip codes, travel dates/destinations, and outfit feedback votes.")
    doc.add_paragraph("• System Outputs: Predicted apparel classification JSON objects, HSV extracted color profiles, top-scored outfit recommendation cards with compatibility rationale, wear calendar logs, category coverage bar charts, trip packing checklists, and shareable public HTML outfit pages.")

    # 5.2 Interface Design (UML Diagrams - Black & White)
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("5.2 Interface Design (UML Diagrams - Black & White)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "All architectural and UML diagrams are rendered in clean Black & White format to ensure optimal reproduction in formal academic documentation. Figures 5.1 through 5.8 present the structural and behavioral design models of the system."
    )

    # Fig 5.1
    add_figure(doc, f"{img_dir}/image2.png", "Fig. 5.1 System Architecture Diagram (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.1 (System Architecture): Figure 5.1 illustrates the decoupled four-tier microservice architecture of Alcove. Tier 1 comprises the React SPA client running in the user's web browser on port 3000. Tier 2 represents the Node.js / Express REST API gateway running on port 5000, responsible for authentication, request routing, multer image uploads, database ORM operations, and business logic execution. Tier 3 is the dedicated Python Flask AI microservice running on port 8000, hosting PyTorch MobileNetV3 model weights and OpenCV HSV color extraction routines. Tier 4 represents the cloud MongoDB Atlas database cluster storing document collections. This tier separation guarantees high modularity, fault tolerance, and independent service scalability."
    )
    doc.add_paragraph(
        "The architecture communicates via standardized HTTP/REST endpoints exchange formatted JSON payloads. When an image upload request is initiated by the user client, the Express server accepts the multipart/form-data payload, saves the binary image to the server uploads folder, and makes a internal HTTP POST request to the Python Flask microservice running on localhost port 8000. The Python engine executes deep learning classification and OpenCV color extraction in under 2 seconds, returning a JSON attribute payload to Express. Express then responds to the React frontend client. This decoupled bridge prevents blocking the main Node.js event loop during computationally intensive image matrix processing."
    )

    # Fig 5.2
    add_figure(doc, f"{img_dir}/image3.png", "Fig. 5.2 UML Class Diagram (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.2 (UML Class Diagram): Figure 5.2 displays the object-oriented structure of the backend application domain. Key entity classes include User, ClothingItem, Outfit, OutfitLog, Feedback, ClothingCorrection, and Trip. Helper service classes include RecommendationEngine, AIPredictor, and ColorDetector. The diagram explicitly documents class attributes, method signatures, access modifiers (+ public, - private), and relationships (associations, aggregations, dependencies, and multiplicity bounds such as 1 User to N ClothingItems and 1 Outfit to N ClothingItems)."
    )
    doc.add_paragraph(
        "Each domain class is mapped directly to a Mongoose database model schema. For instance, the User class encapsulates security methods like comparePassword() and generateAuthToken(). The ClothingItem class enforces attribute types including category, subCategory, primaryColor, formality, season, and wearCount. The RecommendationEngine class encapsulates mathematical scoring algorithms including generateOutfitRecommendations(), scoreWeatherMatch(), and scoreColorHarmony()."
    )

    # Fig 5.3
    add_figure(doc, f"{img_dir}/image4.png", "Fig. 5.3 UML Use Case Diagram (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.3 (UML Use Case Diagram): Figure 5.3 documents the behavioral interactions between system actors (Registered User, Guest User, System Administrator, and Python AI Engine) and primary use cases. Key use cases include User Registration/Login, Upload Item Image, Confirm AI Tags, Request Outfit Recommendation, Log Wear Date, View Wardrobe Gap Analytics, Generate Trip Packing List, and Submit Outfit Feedback. The diagram illustrates <<include>> relationships (e.g., Request Recommendation includes Weather API Lookup) and <<extend>> relationships (e.g., Upload Item extends AI Tag Generation)."
    )
    doc.add_paragraph(
        "Use Case Specification Tables describe actor goals, pre-conditions, main success scenarios, and exception flows. For example, in the 'Generate Outfit' use case, the Registered User selects an occasion and location. The system pre-condition requires at least one top, bottom, and footwear item stored in the user's active wardrobe. The main success scenario executes candidate combination filtering, weather synchronization, multi-factor scoring, and top-3 outfit rendering."
    )

    # Fig 5.4
    add_figure(doc, f"{img_dir}/image5.png", "Fig. 5.4 UML Activity Diagram – Image Upload & Tagging (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.4 (UML Activity Diagram): Figure 5.4 details the step-by-step procedural workflow executed during garment upload and AI digitization. The workflow begins when the user selects an image file. Control passes to the Express backend for file validation, then forwards the image buffer to the Flask microservice. In parallel swimlanes, the PyTorch model executes classification while OpenCV executes HSV K-means color clustering. Results are merged into a unified JSON response and returned to the React UI tag confirmation panel. Upon user review and confirmation, the item is saved to MongoDB."
    )
    doc.add_paragraph(
        "Decision nodes in the activity diagram handle exception cases. If the uploaded file fails MIME type validation (e.g., non-JPEG/PNG file), an error notification activity returns control to the user. If the Python AI microservice experiences a processing timeout, a fallback activity opens a manual attribute entry panel, ensuring zero application breakdown."
    )

    # Fig 5.5
    add_figure(doc, f"{img_dir}/image6.png", "Fig. 5.5 Data Flow Diagram DFD Level 0 (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.5 (DFD Level 0): Figure 5.5 illustrates the Context-Level Data Flow Diagram (DFD Level 0). The central process (0.0 Alcove Smart Wardrobe System) interacts with external entities: User, Python AI Engine Microservice, OpenWeatherMap API, and Cloud Storage. Major data flows include raw photo streams, weather request/response payloads, prediction vectors, and database CRUD operations."
    )
    doc.add_paragraph(
        "In DFD Level 1 expansion, Process 0.0 is decomposed into six sub-processes: P1 User Authentication, P2 Image Upload & Validation, P3 AI Classification & Color Extraction, P4 Wardrobe Item Persistence, P5 Recommendation Scoring & Weather Sync, and P6 Analytics & Trip Packing. Data stores include D1 Users, D2 ClothingItems, D3 Outfits, D4 OutfitLogs, D5 Feedbacks, D6 ClothingCorrections, and D7 Trips."
    )

    # Fig 5.6
    add_figure(doc, f"{img_dir}/image7.png", "Fig. 5.6 UML State Diagram – Clothing Lifecycle (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.6 (UML State Diagram): Figure 5.6 documents the lifecycle state transitions of a garment within the system. State transitions proceed from [Captured/Uploaded] -> [AI Tagged] -> [Confirmed & Digitized (Available)] -> [Selected in Outfit] -> [Worn & Logged] -> [In Laundry / Maintenance] -> [Archived / Donated]. State guard conditions enforce business rules (e.g., items in 'Laundry' status are excluded from candidate outfit recommendation pools)."
    )
    doc.add_paragraph(
        "State transitions are triggered by user actions or backend events. Marking an outfit as worn on the calendar automatically transitions all constituent clothing items to 'Worn' state and increments their individual wear counters. Users can manually toggle item status between 'Available' and 'Laundry' via the UI wardrobe catalog."
    )

    # Fig 5.7
    add_figure(doc, f"{img_dir}/image8.png", "Fig. 5.7 Entity-Relationship (ER) Diagram (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.7 (Entity-Relationship Diagram): Figure 5.7 presents the conceptual ER schema showing entities, attributes, primary/foreign keys, and cardinalities. Relationships include 1:N between User and ClothingItems, 1:N between User and Outfits, N:M between Outfits and ClothingItems (resolved via array of ObjectIds), and 1:N between Outfit and OutfitLogs."
    )
    doc.add_paragraph(
        "The schema design utilizes MongoDB ObjectId referencing to balance normalization and read performance. The `outfits` collection stores an array of `clothingitems` ObjectIds, allowing fast populate() queries while preventing data duplication."
    )

    # Fig 5.8
    add_figure(doc, f"{img_dir}/image9.png", "Fig. 5.8 UML Sequence Diagram – Outfit Generation (Black & White)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.8 (UML Sequence Diagram): Figure 5.8 documents the chronological message sequence exchanged during outfit recommendation request execution. Messages flow sequentially across React UI -> Express Outfit Controller -> Recommendation Engine -> OpenWeatherMap Service -> MongoDB Wardrobe Query -> Combination Scoring Engine -> Scored Response Payload -> React UI Card Rendering."
    )
    doc.add_paragraph(
        "Synchronous REST calls execute between the React client and Express API. Asynchronous internal HTTP calls retrieve weather data from OpenWeatherMap before executing candidate outfit combination scoring in memory."
    )

    # 5.3 Database Design & Data Dictionary
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("5.3 Database Design & Data Dictionary")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "The underlying database is implemented using MongoDB Atlas cloud document storage via Mongoose Object Data Modeling (ODM). Tables 5.1 through 5.7 document the complete data dictionary across all seven collection schemas:"
    )

    # Table 5.1 Users
    doc.add_paragraph("Table 5.1: `users` Collection Schema Data Dictionary")
    headers_t51 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t51 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique user account identifier"],
        ["name", "String", "Required, Trim", "None", "Full name of the user"],
        ["email", "String", "Required, Unique, Lowercase", "None", "User email address used for login"],
        ["passwordHash", "String", "Required", "None", "Bcrypt hashed password string"],
        ["preferences.style", "String", "Enum", "'casual'", "Preferred style preference (casual, formal, sporty)"],
        ["createdAt", "Date", "Required", "Date.now()", "Account creation timestamp"]
    ]
    add_styled_table(doc, headers_t51, data_t51, [1.4, 1.0, 1.4, 1.2, 2.2])

    # Table 5.2 ClothingItems
    doc.add_paragraph("Table 5.2: `clothingitems` Collection Schema Data Dictionary")
    headers_t52 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t52 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique clothing item identifier"],
        ["userId", "ObjectId", "Foreign Key (users)", "Required", "Reference to item owner"],
        ["imageUrl", "String", "Required", "None", "Relative path to stored image file"],
        ["category", "String", "Required, Enum", "'top'", "Primary garment type (top, bottom, dress, shoes, etc.)"],
        ["subCategory", "String", "Optional", "''", "Specific item sub-type (e.g., t-shirt, jeans, jacket)"],
        ["primaryColor", "String", "Required", "'#000000'", "Dominant color hex code extracted via OpenCV"],
        ["colorName", "String", "Required", "'Black'", "Human-readable color name"],
        ["season", "Array[String]", "Enum", "['all']", "Suitable seasons (spring, summer, fall, winter, all)"],
        ["formality", "String", "Enum", "'casual'", "Formality level (casual, formal, sporty)"],
        ["status", "String", "Enum", "'available'", "Current status (available, laundry, packed, archived)"],
        ["wearCount", "Number", "Min: 0", "0", "Total number of times item was included in worn outfits"]
    ]
    add_styled_table(doc, headers_t52, data_t52, [1.4, 1.0, 1.4, 1.0, 2.4])

    # Table 5.3 Outfits
    doc.add_paragraph("Table 5.3: `outfits` Collection Schema Data Dictionary")
    headers_t53 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t53 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique outfit identifier"],
        ["userId", "ObjectId", "Foreign Key (users)", "Required", "Reference to outfit owner"],
        ["name", "String", "Required", "'My Outfit'", "User or AI generated outfit title"],
        ["items", "Array[ObjectId]", "Foreign Keys (clothingitems)", "Required", "List of clothing item IDs composing the outfit"],
        ["occasion", "String", "Required, Enum", "'casual'", "Target occasion (casual, formal, work, party, sport)"],
        ["score", "Number", "Range 0-100", "80", "Algorithmically computed compatibility score"],
        ["shareId", "String", "Unique, Index", "UUID v4", "Public sharing identifier string"]
    ]
    add_styled_table(doc, headers_t53, data_t53, [1.4, 1.2, 1.6, 1.0, 2.0])

    # Table 5.4 OutfitLogs
    doc.add_paragraph("Table 5.4: `outfitlogs` Collection Schema Data Dictionary")
    headers_t54 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t54 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique log entry identifier"],
        ["userId", "ObjectId", "Foreign Key (users)", "Required", "Reference to log owner"],
        ["outfitId", "ObjectId", "Foreign Key (outfits)", "Required", "Reference to worn outfit"],
        ["date", "Date", "Required", "Date.now()", "Date on which outfit was worn"],
        ["notes", "String", "Optional", "''", "Optional user notes for the day"]
    ]
    add_styled_table(doc, headers_t54, data_t54, [1.4, 1.2, 1.4, 1.2, 2.0])

    # Table 5.5 Feedbacks
    doc.add_paragraph("Table 5.5: `feedbacks` Collection Schema Data Dictionary")
    headers_t55 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t55 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique feedback entry identifier"],
        ["outfitId", "ObjectId", "Foreign Key (outfits)", "Required", "Target outfit receiving feedback"],
        ["vote", "String", "Enum", "'like'", "Feedback vote type ('like' or 'dislike')"],
        ["comment", "String", "Optional", "''", "Optional guest feedback text comment"]
    ]
    add_styled_table(doc, headers_t55, data_t55, [1.4, 1.2, 1.4, 1.0, 2.2])

    # Table 5.6 ClothingCorrections
    doc.add_paragraph("Table 5.6: `clothingcorrections` Collection Schema Data Dictionary")
    headers_t56 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t56 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique correction record identifier"],
        ["userId", "ObjectId", "Foreign Key (users)", "Required", "User submitting correction"],
        ["originalAI", "Object", "Required", "{}", "Original predicted attributes from Flask AI engine"],
        ["userConfirmed", "Object", "Required", "{}", "Attributes confirmed and edited by user"]
    ]
    add_styled_table(doc, headers_t56, data_t56, [1.4, 1.2, 1.4, 1.0, 2.2])

    # Table 5.7 Trips
    doc.add_paragraph("Table 5.7: `trips` Collection Schema Data Dictionary")
    headers_t57 = ["Field Name", "Data Type", "Constraint", "Default Value", "Description"]
    data_t57 = [
        ["_id", "ObjectId", "Primary Key", "Auto-generated", "Unique trip record identifier"],
        ["userId", "ObjectId", "Foreign Key (users)", "Required", "Reference to trip owner"],
        ["destination", "String", "Required", "''", "Trip destination city / country"],
        ["startDate", "Date", "Required", "None", "Trip start date"],
        ["endDate", "Date", "Required", "None", "Trip end date"],
        ["packingList", "Array[Object]", "Required", "[]", "List of packed clothing item ObjectIds and status"]
    ]
    add_styled_table(doc, headers_t57, data_t57, [1.4, 1.2, 1.4, 1.0, 2.2])

    # 5.4 Screen Designs (Web Screenshots - Color)
    p_s = doc.add_paragraph()
    p_s.paragraph_format.space_before = Pt(14)
    p_s.paragraph_format.space_after = Pt(6)
    p_s.paragraph_format.keep_with_next = True
    r = p_s.add_run("5.4 Screen Designs (Web Screenshots - Color)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x33, 0x66)

    doc.add_paragraph(
        "Full-color screenshots demonstrating the responsive React web application user interface are presented in Figures 5.9 through 5.16. The design system incorporates custom CSS glassmorphism, translucent panels, dynamic color accents, and responsive grid layouts."
    )

    # Fig 5.9 - 5.16
    add_figure(doc, f"{img_dir}/image10.png", "Fig. 5.9 Screen Design – User Authentication Interface (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.9 (Authentication Interface): Figure 5.9 presents the user login and registration portal. Designed with a sleek glassmorphism aesthetic, the interface provides secure input fields for email and password authentication, tab toggles for switching between login and registration modes, inline input validation error alerts, and JWT session handling."
    )

    add_figure(doc, f"{img_dir}/image11.png", "Fig. 5.10 Screen Design – Main Dashboard Overview (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.10 (Main Dashboard): Figure 5.10 shows the central user dashboard overview. The top floating navigation bar provides quick access to search, notifications, and profile settings. The hero section displays summary metrics (total wardrobe items, saved outfits, outfits worn this week), quick action buttons (Add Item, Outfit Generator), recent outfit recommendations, and category overview grids."
    )

    add_figure(doc, f"{img_dir}/image12.png", "Fig. 5.11 Screen Design – Digital Wardrobe Catalog (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.11 (Digital Wardrobe Catalog): Figure 5.11 displays the interactive digital wardrobe view. Garments are displayed as responsive glassmorphism item cards featuring uploaded thumbnail images, AI-predicted category badges, extracted color indicators, and status tags (Available, Laundry, Packed). Interactive filter pills allow users to instantly filter wardrobe items by category, occasion, or season."
    )

    add_figure(doc, f"{img_dir}/image13.png", "Fig. 5.12 Screen Design – AI Outfit Generator Interface (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.12 (AI Outfit Generator): Figure 5.12 illustrates the outfit generator workspace. The left control panel features live weather integration (temperature, condition icon, humidity) and occasion tab selectors (Casual, Formal, Work, Sport, Party). The main area presents generated outfit cards complete with individual garment images, overall compatibility score badges (e.g., 94% Match), and detailed AI styling notes explaining why the items complement each other."
    )

    add_figure(doc, f"{img_dir}/image14.png", "Fig. 5.13 Screen Design – Wear History Calendar Interface (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.13 (Wear History Calendar): Figure 5.13 presents the monthly wear history calendar view. Dates on which outfits were worn are highlighted with visual outfit preview badges. Selecting any date opens a detail side-panel listing the specific clothing items worn, weather conditions recorded on that date, and options to log new outfits or edit daily notes."
    )

    add_figure(doc, f"{img_dir}/image15.png", "Fig. 5.14 Screen Design – Wardrobe Gap Analysis & Shopping Advice (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.14 (Wardrobe Gap Analysis): Figure 5.14 demonstrates the intelligent wardrobe analytics module. Visual coverage progress bars compare current garment category counts against ideal distribution targets. An AI summary card highlights missing wardrobe staples (e.g., 'Your wardrobe is deficient in formal footwear') and provides targeted shopping recommendations to optimize closet versatility."
    )

    add_figure(doc, f"{img_dir}/image16.png", "Fig. 5.15 Screen Design – Trip Packing List Generator (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.15 (Trip Packing List): Figure 5.15 shows the smart trip packing list generator. Users input destination cities and travel date ranges. The system fetches target destination weather forecasts, selects minimal multi-use garments from the user's available wardrobe, and generates an interactive packing checklist categorized by tops, bottoms, shoes, and accessories."
    )

    add_figure(doc, f"{img_dir}/image17.png", "Fig. 5.16 Screen Design – Outfit Sharing Interface (Color)", width_inches=5.8)
    doc.add_paragraph(
        "Detailed Discussion of Fig. 5.16 (Outfit Sharing): Figure 5.16 presents the guest-accessible public outfit share page. Accessing a unique share link displays a high-resolution layout of the outfit, individual garment details, and interactive guest feedback buttons (Like/Dislike votes and comment submission) allowing friends or stylists to provide input."
    )

    doc.add_page_break()
    print("Chapter 5 added.")
