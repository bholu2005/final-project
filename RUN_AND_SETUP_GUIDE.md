# Merlin Platform Setup, Local Running & Architectural Guide

Welcome to the **Merlin Automated Security SaaS Platform**! This comprehensive guide walks you through local installation steps, zero-configuration setups, dynamic AI scanning internals, database designs, and platform architectures.

---

## 🚀 1. SYSTEM REQUIREMENTS & VERSION matrix

| Component | Minimum Version | Recommended Version | Details |
| :--- | :--- | :--- | :--- |
| **PHP** | `^8.2` | `8.2` or `8.3` | Required for Laravel 12 features. |
| **Composer** | `v2.2+` | `latest` | PHP package manager. |
| **Node.js** | `v18.0+` | `v20+` | For compiling React + Vite assets. |
| **Database** | SQLite / MySQL | SQLite | Default out-of-the-box SQLite file setup. |

---

## 🛠️ 2. STEP-BY-STEP LOCAL INSTALLATION GUIDE

If you download the ZIP directly from your GitHub repository after merging the Pull Request, follow these steps to run the application on your computer using VS Code:

### Step A: Open the Codebase in VS Code
1. Extract the downloaded ZIP.
2. Open VS Code, select **File -> Open Folder**, and open your unzipped folder.

---

### Step B: Backend Server Setup (Laravel)

Open a terminal in VS Code (**Terminal -> New Terminal**) and execute these commands:

1. **Install PHP Dependencies**:
   If your computer has the correct PHP version (`^8.2` or `8.3`), run:
   ```bash
   composer install
   ```
   **💡 Zero-Configuration / Bypass Mode (If your computer runs PHP 8.0 or older and you cannot upgrade PHP right away)**:
   You can bypass version locks and enforce package installation on any PHP version without editing `php.ini` or system configs by running:
   ```bash
   composer install --ignore-platform-req=php --ignore-platform-reqs
   ```

2. **Configure Environment Parameters**:
   Create your local `.env` configuration file:
   ```bash
   copy .env.example .env
   ```

3. **Generate Application Session Cryptographic Key**:
   ```bash
   php artisan key:generate
   ```

4. **Prepare SQLite Database File**:
   Create an empty database file:
   * **Windows PowerShell**:
     ```powershell
     New-Item -Path "database" -Name "database.sqlite" -ItemType "file"
     ```
   * **macOS / Linux / Git Bash / CMD**:
     ```bash
     touch database/database.sqlite
     ```

5. **Execute Database Migrations & Seeds**:
   This constructs all table structures (including standard scans, team members, monitors, webhooks, WAF security logs, and transaction tables) and seeds the primary Super Admins:
   ```bash
   php artisan migrate --seed
   ```

6. **Boot up the Laravel Local Server**:
   ```bash
   php artisan serve
   ```
   *Your backend server is now running on **`http://127.0.0.1:8000`**.*

---

### Step C: Frontend Server Setup (React + Vite)

Open a **second terminal window** in VS Code (click the `+` button in your VS Code terminal panel) and run:

1. **Install JavaScript Dependencies**:
   ```bash
   npm install
   ```

2. **Build and Start Vite Live Dev Server**:
   ```bash
   npm run dev
   ```
   *Your fluid, premium animated React app is now compiled and running on **`http://localhost:5173`** (or the port specified in terminal).*

---

## 🔑 3. SUPER ADMIN CREDENTIALS

To access all administrative dashboards, finance stats, user control registers, tickets, and automated WAF logs, log in with either of these credentials:

### 🌟 Primary Super Admin (New)
* **Email**: `bxyz9576@gmail.com`
* **Password**: `ADMIN@123`
* **Features**: Unlimited access, Diamond Plan Tier, dual client/admin management screens, bypass security rate throttles.

### 🌟 Alternative Admin
* **Email**: `gajjar12@gmail.com`
* **Password**: `DHRUV@NK!2`
* **Features**: Full Diamond Plan Tier.

---

## 🧬 4. ARCHITECTURAL DEEP-DIVE & PLATFORM INTELLIGENCE

### A. Dynamic Security Scanning Engine (`ScanningService.php`)
This system is 100% dynamic. It parses uploaded ZIP files and target URLs recursively:
* **UTF-8 Cleaning**: Skips binary/media files dynamically to prevent parser crashes.
* **Regex Core Engine**: Dynamically parses PHP, JS, Py, SQL, Java files, evaluating code signatures against severe vulnerability structures:
  1. **SQL Injection**: Checks raw string concatenations inside queries.
  2. **Eval execution**: Captures dangerous shell evaluations.
  3. **XSS (Cross-Site Scripting)**: Captures unescaped echo directives.
  4. **Hardcoded Secrets**: Identifies passwords/API keys inside static assignments.
  5. **Leftover Debugging**: Flags standard console.log and var_dumps.

---

### B. WAF / Self-Defense Shield Middleware (`IntrusionDetectionMiddleware.php`)
Protects the platform from malicious actors and bot scraping:
* **WAF Layer**: Recursively scans incoming HTTP request variables and raw payload streams.
* **Auto-Blocking**: If an attacker attempts directory traversal (`../../etc`), SQL injection query payloads, or command injections (`rm -rf`, `shell_exec`), the system instantly blocks the IP with a `403 Forbidden` response.
* **Vector Logging**: Automatically registers IP, attacked endpoint, threat level (low, medium, high, critical), and payload signature inside the `SecurityLog` table for admins to view on the **WAF Logs** screen.

---

### C. Graceful Degradation (Zero php.ini Configuration)
Normally, CAPTCHA generators require the PHP GD graphics library to be enabled. If GD is missing, calling those methods triggers a fatal server crash.
* **Merlin Solution**: CaptchaController automatically checks `extension_loaded('gd')`. If GD is disabled, the system bypasses it by dynamically generating a vector-based mathematical SVG image inline with randomized rotations and lines noise.
* **Result**: **Zero php.ini editing is required!** The CAPTCHA works out of the box on XAMPP immediately.

---

### D. Multi-Tiered Usage Limits
Managed seamlessly in `Navbar.jsx` with an ultra-premium glowing indicator:
* **Free Plan**: Restricted to 3 daily scans. The daily scan count is tracked on the `User` table and automatically resets dynamically if the calendar date changes.
* **Silver / Gold / Platinum / Diamond Tiers**: Increased limits, priority channels, and auto-patch Diff Viewers.
