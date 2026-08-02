# Merlin Security Platform: Production-Grade Deployment & System Playbook

Welcome to the **Merlin Security Platform**, an advanced AI-powered security sandbox, static analysis SAST engine, live response header auditor, and automated code-patching ecosystem.

This guide serves as a complete blueprint to set up, operate, and deploy Merlin in both development and production-grade environments.

---

## 📂 1. System Blueprint & Directory Mapping

This blueprint details the files and folders across the application, with new enterprise components highlighted with `(NEW)`.

```text
merlin-security/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php          # Auth & user registration controller.
│   │   │   ├── CaptchaController.php       # Dynamic CAPTCHA engine (with SVG fallbacks).
│   │   │   ├── ScanController.php          # Main SAST scan and report controller.
│   │   │   ├── SubscriptionController.php  # Handles Premium upgrade payments.
│   │   │   ├── ToolController.php          # Web header inspection utility controller.
│   │   │   └── TeamController.php          # Internal organization scope directory.
│   │   └── Middleware/
│   │       └── IntrusionDetectionMiddleware.php # Active threat WAF (blocks SQLi, Traversals).
│   ├── Models/
│   │   ├── User.php                        # Account metadata and usage limits tracking.
│   │   ├── Scan.php                        # Parsed vulnerability audits JSON store.
│   │   ├── Transaction.php                 # Payment ledger logs (Silver, Gold, Platinum, Diamond).
│   │   ├── SecurityLog.php                 # Malicious parameters logged by the WAF shield.
│   │   └── Ticket.php                      # Client Support tickets.
│   └── Services/
│       ├── ScanningService.php             # Core SAST engine: safelisted decompressions & AST pattern matching.
│       └── UrlScanningService.php          # Web crawler simulating live page user behavior.
│
├── backend/                                (NEW) # Microservices & Core AI Orchestration Gateway
│   ├── api_gateway.py                      (NEW) # API request throttling, validation, and microservice proxy.
│   ├── ai/                                 (NEW) # AI Core and LLM Orchestration
│   │   ├── prompts/                        (NEW) # Prompts repository & templates store.
│   │   │   └── prompt_templates.json       (NEW) # JSON prompt templates for OWASP-10 audits.
│   │   ├── embeddings/                     (NEW) # Generates embeddings for source code chunks.
│   │   │   └── embedder.py                 (NEW) # Semantic vectorize script using SentenceTransformer/OpenAI.
│   │   ├── rag/                            (NEW) # Retrieval-augmented generation logic.
│   │   │   └── retriever.py                (NEW) # Fetches secure secure code contextual patches.
│   │   ├── memory/                         (NEW) # Persistent conversations memory buffer.
│   │   │   └── session_memory.py           (NEW) # Memory session tracker for the chatbot.
│   │   ├── tools/                          (NEW) # Execution tools inside secure sandboxes.
│   │   │   └── code_executor.py            (NEW) # Isolated PHP/JS syntax checks & linting tools.
│   │   ├── orchestrator/                   (NEW) # multi-step security agent actions planner.
│   │   │   └── agent_orchestrator.py       (NEW) # Coordinates Retriever, Parser, and Executor.
│   │   └── agents/                         (NEW) # Security Agent definitions.
│   │       └── security_agent.py           (NEW) # System prompt and agent configurations.
│   └── services/                           (NEW) # System background worker components
│       ├── cache/                          (NEW) # Cache connections.
│       │   └── redis_client.py             (NEW) # Cache handlers utilizing Redis.
│       └── worker/                         (NEW) # Background queue job executors.
│           └── job_worker.py               (NEW) # Simulates intensive zip analysis asynchronously.
│
├── training/                               (NEW) # AI Training & Model Evaluation Pipeline
│   ├── data/                               (NEW) # Ingestion datasets.
│   │   └── sample_train_dataset.json       (NEW) # Golden dataset pairing vulnerable and secure code.
│   ├── preprocessing/                      (NEW) # Scripts for chunking, sanitizing, and tokenizing raw scripts.
│   │   └── chunker.py                      (NEW) # Splits source codes by logical code segments.
│   ├── model/                              (NEW) # Pre-trained model architectures and finetuning files.
│   │   └── config.json                     (NEW) # LoRA target weights fine-tuning values.
│   └── evaluation/                         (NEW) # Evaluates generated remediations accuracy.
│       └── metrics.py                      (NEW) # Precision, recall, and overlap ratios evaluation scripts.
│
├── models/                                 (NEW) # Registered production weights & metadata registry
│   └── model_registry_client.py            (NEW) # Tracks deployment tags and parent versions.
│
├── vector_db/                              (NEW) # Vector store connection wrapper files
│   └── qdrant/                             (NEW) # Ingestion and query adapters for Qdrant
│       └── client_wrapper.py               (NEW) # Ingestion of chunk vectors and cosine search payloads.
│
├── docker/                                 (NEW) # Containerization Configurations
│   └── docker-compose.yml                  (NEW) # Orchestrates Larvel App, Redis cache, and Qdrant DB.
│
├── kubernetes/                             (NEW) # Helm deployment parameters for K8s clusters
│   └── helm-values.yaml                    (NEW) # Replica auto-scalers and hardware quotas.
│
├── monitoring/                             (NEW) # Telemetry scraper target configurations
│   └── prometheus.yml                      (NEW) # Scrape targets for web platform and vector stores.
│
├── logging/                                (NEW) # Centralized Logging Setup
│   └── opentelemetry-collector-config.yaml (NEW) # Traverses spans, metrics, and trace pipelines.
│
├── ci/                                     (NEW) # Automated continuous integration scripts
│   └── github-actions-ci.yml               (NEW) # Complete Composer/NPM/PHPUnit CI testing workflow.
│
├── tools/                                  (NEW) # External API Adapters
│   └── api_adapters.py                     (NEW) # Query live global CVE vulnerabilities indices.
│
└── security/                               (NEW) # Gateway Security Components
    ├── auth/                               (NEW) # OAuth verification adapters.
    │   └── oauth_connector.py              (NEW) # Verifies Google/GitHub tokens and maps profiles.
    ├── api_gateway/                        (NEW) # API Rate Limiter classes.
    │   └── rate_limiter.py                 (NEW) # Dynamic token-bucket throttlers.
    └── prompt_sanitizer/                   (NEW) # Guardrails against prompt injections.
        └── guardrails.py                   (NEW) # Strains input payloads to prevent override prompt injections.
```

---

## 🛠️ 2. Core Module Descriptions

1. **AI Core Gateway (`backend/ai/`):** Orchestrates deep-learning LLMs, matching context through vector lookups to output verified, syntactically clean PHP/JS remediation diffs.
2. **Data & Preprocessing (`training/`):** Prepares, tokenizes, and segments code repositories into semantically rich chunks ready to generate custom security-model weights.
3. **MLOps Registry (`models/`):** Tracks and rolls back fine-tuned neural models (e.g. customized Qwen-Coder and DeepSeek models).
4. **Vector Database (`vector_db/`):** Manages collections, handles high-performance cosine similarity searches, and maps code chunk indexes in Qdrant.
5. **DevOps Engine (`docker/`, `kubernetes/`):** Streamlines cluster deployments with pre-built Helm parameters and Docker configurations.

---

## 🖥️ 3. Comprehensive UI Operations Manual

### A. Authentication & OAuth Integrations
- **Manual Input:** Authenticate using email and password. Input validation is strictly guarded by the dynamic SVG CAPTCHA to block bot scripting attacks.
- **Federated Logins:** Click "Continue with Google" or "Continue with GitHub" to trigger simulated OAuth verifications. Profiles are automatically routed to standard accounts or the master Super Admin workspace depending on standard scopes.

### B. Navigation Center
- **Public Area:** Unauthenticated guests can freely browse the `HeroSection` (landing page), creator/founder directories, and the comprehensive `PricingPage`.
- **Protected Workspace:** Clicking "Start Scan" or accessing dashboard internal pages switches the client layout to the premium, collapsible left sidebar.
- **Collapsible Sidebar:** Hover over the logo to expand. It dynamically tracks and lists recent user scans, offers deep dark mode toggles, and seats settings/profile cards at the bottom.

### C. Live Security Assistant ("Try AI")
- Mapped as a custom AI chat console featuring typing dot animations.
- Paste queries like `"Check SQLi risk: SELECT * FROM admin WHERE user = $u"` to generate real-time PDO-parameterized coding patches.

### D. Control Tower (Admin Dashboard)
- **Telemetry & Health:** Tracks live CPU, GPU loads, active queue metrics, and Qdrant cache hit ratios.
- **Models & Fine-Tuning:** Manage deployable LLMs, review model precision accuracies, and execute rollbacks.
- **Datasets & Knowledge Store:** Monitor processed datasets, verify size parameters, and download compliance logs.

---

## 🚀 4. Installation & Local Execution

### Backend Prerequisites & Configuration
1. Install **PHP 8.2+**, **Composer**, **Node.js (v18+)**, and **SQLite3**.
2. Run standard installation commands:
   ```bash
   composer install
   php artisan key:generate
   ```
3. Initialize the database and run migrations:
   ```bash
   touch database/database.sqlite
   php artisan migrate:fresh --seed
   ```

### Frontend Assets Compilation
Install package dependencies and execute Vite builds:
```bash
npm install
npm run build
```

### Start Development Server
Boot up the PHP development server:
```bash
php artisan serve
```
Open `http://127.0.0.1:8000` in your web browser.

---

## 🐳 5. Containerized Production Setup

Start the complete application stack (app, redis, qdrant, and prometheus) using Docker Compose:
```bash
docker-compose -f docker/docker-compose.yml up --build -d
```
Deploy the Kubernetes cluster:
```bash
helm install merlin-platform kubernetes/ -f kubernetes/helm-values.yaml
```
Your application will be live on port `80` behind the cluster load balancer.
