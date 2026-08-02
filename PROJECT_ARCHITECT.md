# Merlin Security Platform: System Architecture & Blueprint

This document serves as a complete **System Architecture and Codebase Blueprint** for the Merlin Security Platform. It outlines the directory hierarchy, database models, state-management routing patterns, and provides comprehensive summaries of key backend services and frontend pages to help future AI assistants instantly build an accurate mental model of this application.

---

## 📂 1. Directory Tree & Key File Mappings

```text
merlin-security/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php          # Registers users, sanitizes logins, and generates tokens.
│   │   │   ├── CaptchaController.php       # Generates SVG-based mathematical CAPTCHAs.
│   │   │   ├── ScanController.php          # Triggers SAST analysis and logs scan results.
│   │   │   ├── SubscriptionController.php  # Handles premium tier upgrades and transactions.
│   │   │   ├── ToolController.php          # Runs live HTTP security response header audits.
│   │   │   └── TeamController.php          # Manages team members.
│   │   └── Middleware/
│   │       └── IntrusionDetectionMiddleware.php # Custom WAF: Blocks SQLi, RCE, and Directory Traversals.
│   ├── Models/
│   │   ├── User.php                        # User accounts, daily scan counters, and subscription plan tracking.
│   │   ├── Scan.php                        # Saved audit results containing JSON code vulnerabilities array.
│   │   ├── Transaction.php                 # Payment ledger logs (Silver, Gold, Platinum, Diamond).
│   │   ├── SecurityLog.php                 # Logged malicious traffic flagged by the active WAF shield.
│   │   └── Ticket.php                      # Customer support issues.
│   └── Services/
│       ├── ScanningService.php             # Core SAST engine: safelisted decompressions & AST pattern matching.
│       └── UrlScanningService.php          # Web crawler simulating live page user behavior.
├── database/
│   ├── migrations/                         # Migration scripts for Users, Scans, Transactions, and Logs.
│   └── database.sqlite                     # SQLite production database.
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── Navbar.jsx                  # Collage left sidebar with dynamic recent history lists.
│   │   │   ├── Footer.jsx                  # Landing footer.
│   │   │   └── CookieBanner.jsx            # Sleek sliding cookie banner.
│   │   ├── Pages/
│   │   │   ├── Home.jsx                    # Core State Machine Router (Admin vs Client layouts).
│   │   │   ├── HeroSection.jsx             # Public Landing Page with interactive creator biography.
│   │   │   ├── AuthPage.jsx                # Responsive access terminal featuring Google & GitHub simulations.
│   │   │   ├── AiAssistantPage.jsx         # Custom ChatGPT/Claude-styled SecGuard Assistant.
│   │   │   ├── ScanPage.jsx                # Target configuration interface with custom settings.
│   │   │   ├── ScanningProcess.jsx         # Animated file-parsing terminal matrix screen.
│   │   │   ├── Dashboard.jsx               # Security stats graphs, scores, grades, and code fixes.
│   │   │   ├── CodePatchSandboxPage.jsx    # Visual original vs patched visual compare window.
│   │   │   └── LiveToolsPage.jsx           # Connection status and security header audits.
│   │   └── app.jsx                         # Inertia-style SPA entry point.
├── routes/
│   ├── api.php                             # Authenticated and Public API endpoint mappings.
│   └── web.php                             # Single Page Application loading endpoint.
└── tests/
    └── Feature/                            # Automated PHPUnit security & business tests.
```

---

## ⚙️ 2. Core Architectural Pillars

### 🔐 Multi-Role & State Routing Routing Model (`Home.jsx`)
Instead of heavy traditional pages reloading, Merlin operates as a fast, high-performance **Single Page State Machine**.
- Guest users can only view `'Home'` (the public landing page) and `'Pricing'`.
- Accessing internal areas (Dashboard, Scan, Monitor, Reports) triggers a sleek redirection to `'Auth'`.
- Upon login, user role parameters (`admin` vs `user`) determine the main navigation structure:
  - **Admins** render the administration navbar with controls over finance statistics, support tickets, system-wide settings, and live intrusion logs.
  - **Standard Client Users** render a gorgeous, responsive, collapsible left sidebar reminiscent of **ChatGPT & Claude**.

### 🛡️ Web Application Firewall Shield (`IntrusionDetectionMiddleware.php`)
Every API call passes through a custom self-defense interceptor which inspects URL query metrics and POST parameters against high-risk directory traversals, arbitrary script injections, and unescaped SQL patterns. It dynamically:
1. Logs suspicious requests into the SQLite database.
2. Rejects malicious callers with a clean `403 Forbidden` response.

### 🧩 Graceful CAPTCHA Fallback Engine (`CaptchaController.php`)
To provide extreme environment portability (such as local machines running XAMPP/Docker without the PHP Graphics `gd` extension), the Captcha generator automatically:
- Checks if GD is active.
- If disabled, it falls back to rendering a mathematical SVG code structure with inline visual noise dynamically, preventing server-level crashes.

---

## 📝 3. Core Engine Code Blueprint

### 🔬 Dynamic SAST Engine (`ScanningService.php`)
This service extracts uploaded `.zip` archives into isolated folders and scans source files (`.php`, `.js`, `.sql`, etc.) line-by-line using precise regular expressions, returning OWASP top 10 risks while avoiding false positives:

```php
// Compares query formatting safely
if (preg_match('/(SELECT|INSERT|UPDATE|DELETE)\s+.*\s+FROM\s+.*WHERE\s+.*=\s*[\'"]?\$[a-zA-Z0-9_]+/i', $line)) {
    $issues[] = [
        'name' => 'SQL Injection Vulnerability',
        'severity' => 'High',
        'type' => 'Security',
        'description' => 'Unescaped variable concatenation found in query string.',
        'fix_suggestion' => "$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');"
    ];
}
```

---

## 🎨 4. Frontend Workspace & UX Standards

1. **Collapsible Left Sidebar (`Navbar.jsx`):** Collapses dynamically to save horizontal space, revealing clear Lucide icons. Fetches recent user audits via `/api/scans` to populate the history panel, mirroring ChatGPT's sidebar history.
2. **AI Security Assistant (`AiAssistantPage.jsx`):** Features custom dual dark/light theme options, an active typing indicator with bouncing dots, and automated code-block formatting.
3. **Responsive Grid Layouts:** Forms, captchas, and sidebars utilize responsive Tailwind configurations (`flex-col sm:flex-row`, `grid-cols-1 sm:grid-cols-2`) to guarantee flawless visual layouts on all devices.

---

## 🧪 5. Testing & Developer Utilities

- **Unit/Feature Testing:** Run `vendor/bin/phpunit` to run automated test configurations.
- **Frontend Assets Compilation:** Run `npm run build` to build optimal, minified production chunks.
- **Development Server:** Run `php artisan serve` to start the backend router at `http://127.0.0.1:8000`.
