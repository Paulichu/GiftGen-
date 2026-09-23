# INCANTO — 13 Offline AI / BCI / Biometric PWA Prototypes

**Turnkey AI OS — Full Commercial Buyout Ready**

A complete bundle of 13 working PWA applications (100% offline, full source code) across SaaS / Web3 / AI / BCI / eIDAS 2.0.

**Live Demos:** https://ojjja.xyz  
**Contact:** mepaulaj@gmail.com | [LinkedIn](https://www.linkedin.com/in/paulina-jakubowska-65712b163)

---

## 📋 Table of Contents

1. [What's Included](#whats-included)
2. [System Requirements](#system-requirements)
3. [Quick Start (No Install)](#quick-start-no-install)
4. [Detailed Installation](#detailed-installation)
5. [Configuration](#configuration)
6. [Deployment](#deployment)
7. [Project-by-Project Guide](#project-by-project-guide)
8. [Tech Stack](#tech-stack)
9. [Licensing](#licensing)
10. [Support](#support)

---

## 📦 What's Included

The bundle contains **13 independent projects**:

| # | Project | Type | Tech |
|---|---------|------|------|
| 1 | **ThinkLink BCI** | EEG + haptic, offline PWA | TensorFlow.js |
| 2 | **Perceptio** | Neurofeedback visualization | Canvas, JS |
| 3 | **NeuroMusic** | EEG → MIDI brain music | Web Audio API |
| 4 | **IrisVerify ID** | Iris + ZK-proof KYC (eIDAS 2.0) | MediaPipe, TFJS, OpenCV.js |
| 5 | **Quantum Vault / IrisVault** | Biometric wallet, quantum-resistant | Web Crypto API |
| 6 | **Kobalt AI Builder** | Offline Lovable/v0 clone | HTML, localStorage |
| 7 | **Vibe Coder** | AI code generator PWA | OpenAI / Mistral |
| 8 | **Kobalt Automation** | Workflow automation | JS, API |
| 9 | **ASI Bridge** | Agent orchestration | AI agents, MCP |
| 10 | **CRM AI + Asystent Sprzedaży** | LinkedIn + GitHub automation | JS, localStorage |
| 11 | **45 Mini SaaS HTML** | Bundle of 45 micro-apps | HTML, CSS, JS |
| 12 | **ClusterLaunch** | K3s + Grafana AWS Kit | Terraform, AWS |
| 13 | **INCANTO OS** | Bundle of all as one system | Combined |

---

## 💻 System Requirements

### Minimum (for PWA projects: 1–11, 13)

- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet:** Required only for first load (PWA caching allows offline use after)
- **Storage:** ~50 MB for PWA cache

### Recommended (for AI/Web3 projects)

- **Node.js:** 18+ (for local dev servers)
- **API keys:** OpenAI / Anthropic / Mistral (for AI features)
- **Crypto wallet:** Phantom or MetaMask (for Web3 features)

### For ClusterLaunch (#12)

- **AWS account** (free tier works)
- **Terraform:** 1.5+
- **AWS CLI:** configured with credentials
- **Domain:** optional (for public demo)

---

## ⚡ Quick Start (No Install)

Most projects are **standalone HTML files** — no build, no install, no server.

### Method 1: Open in browser

1. Download the repository as ZIP
2. Unzip to any folder
3. Open `index.html` in Chrome / Firefox / Safari
4. All PWA projects work immediately

### Method 2: Local server (recommended for AI features)

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Then open http://localhost:8000 in your browser.

## 🔧 Detailed Installation

### Step 1: Clone or download

```bash
git clone https://github.com/[your-username]/incanto.git
cd incanto
```

Or download ZIP and unzip.

### Step 2: Install Node.js dependencies (for projects 6–10, 13)

```bash
# Check Node.js version
node --version  # must be 18+

# Install dependencies
npm install
```

### Step 3: Configure environment variables

Create a `.env` file in the root:

```env
# AI Providers (required for Kobalt AI Builder, Vibe Coder, ASI Bridge)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...

# Supabase (for SIT v2.0 — if included)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=...

# Replicate (for voice generation in SIT)
REPLICATE_API_TOKEN=r8_...

# Web3 (for IrisVault, Quantum Vault)
TON_API_KEY=...
```

Never commit `.env` to Git. It is already in `.gitignore`.

---

## ⚙️ Configuration

### AI Providers

Each AI project requires your own API keys:

| Project | Provider | Where to get key |
|---|---|---|
| Kobalt AI Builder | Claude, OpenAI, Mistral | console.anthropic.com / platform.openai.com / console.mistral.ai |
| Vibe Coder | OpenAI, Mistral | same as above |
| ASI Bridge | OpenAI | platform.openai.com |
| SIT v2.0 (voice) | Replicate | replicate.com/account/api-tokens |

Free tiers available — see provider websites for limits.

### PWA Configuration

Each PWA has a `manifest.json`. Update:

```json
{
  "name": "Your App Name",
  "short_name": "ShortName",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#08090d",
  "theme_color": "#08090d",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker

Each PWA includes `service-worker.js` with cache-first strategy:

```javascript
const CACHE_NAME = 'incanto-v1';
const URLS = ['./', './index.html', './app.js', './style.css'];
// ... install, activate, fetch handlers
```

To change caching behavior, edit the `URLS` array.

---

## 🚀 Deployment

### Option 1: Vercel (Recommended — Fastest)

```bash
npm i -g vercel
vercel
```

Your project will be live at https://your-project.vercel.app.

### Option 2: Netlify

1. Go to netlify.com/drop
2. Drag and drop the entire folder
3. Done — live URL in seconds

### Option 3: GitHub Pages

1. Push code to GitHub
2. Go to Settings → Pages
3. Set source to main branch, root folder
4. Save — live at https://[username].github.io/[repo]

### Option 4: Hostinger (for custom domain)

1. Log into hPanel → File Manager
2. Upload all files to `public_html/`
3. Ensure `index.html` is in the root
4. Enable SSL (Let's Encrypt)
5. Done

### Option 5: ClusterLaunch (AWS)

```bash
cd terraform/aws
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your AWS settings
terraform init
terraform plan
terraform apply -auto-approve
```

This deploys:

- K3s cluster on AWS (ARM64 Graviton — 20% cost savings)
- Prometheus + Grafana monitoring
- Traefik ingress
- SSM Session Manager tunneling

---

## 📖 Project-by-Project Guide

1. **ThinkLink BCI** — `thinklink/index.html`; offline EEG simulation and haptic feedback; deploy to Vercel / Netlify.
2. **Perceptio** — `perceptio/index.html`; neurofeedback visualization; no API key; static hosting.
3. **NeuroMusic** — `neuromusic/index.html`; EEG → MIDI conversion using Web Audio API; static hosting.
4. **IrisVerify ID** — `irisverify/index.html`; camera access, MediaPipe Iris, and ZK-proof KYC; HTTPS required.
5. **Quantum Vault / IrisVault** — `irisvault/index.html`; camera access, Web Crypto API, and AES-256-GCM encryption; HTTPS required.
6. **Kobalt AI Builder** — `kobalt-html/index.html`; Claude / OpenAI / Mistral key in settings; static hosting.
7. **Vibe Coder** — `vibe-coder/index.html`; OpenAI / Mistral code generation; static hosting.
8. **Kobalt Automation** — `kobalt-automation/index.html`; cron and API workflows; Node.js server recommended.
9. **ASI Bridge** — `asi-bridge/index.html`; agent orchestration and MCP; Node.js server.
10. **CRM AI + Asystent Sprzedaży** — `crm-ai/index.html` and `asystent-sprzedazy/index.html`; localStorage pipeline and prospects; static hosting.
11. **45 Mini SaaS HTML** — `45-mini-saas/index.html`; 45 micro-apps; no API key; static hosting.
12. **ClusterLaunch** — `terraform/aws/`; AWS credentials and Terraform variables; K3s, Grafana, Prometheus, and Loki.
13. **INCANTO OS** — `index.html`; unified dashboard for all 13 projects; static hosting.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, React, Vite, Tailwind CSS |
| AI/ML | TensorFlow.js, MediaPipe Iris, OpenCV.js (WASM), OpenAI, Anthropic, Mistral, Replicate |
| Biometrics | MediaPipe, Web Crypto API (AES-256-GCM), snarkjs (ZK-proofs) |
| Blockchain | TON, Web3.js, Phantom wallet |
| Infrastructure | Terraform, AWS (EC2, Graviton ARM64), K3s, Prometheus, Grafana, Loki, Traefik |
| Backend | Node.js, Supabase, serverless functions (Vercel) |
| Storage | localStorage (offline-first), Supabase (cloud) |
| Deployment | Vercel, Netlify, GitHub Pages, Hostinger, AWS |

---

## 📜 Licensing

Three licensing options are available:

- **Commercial License (Single Project): €5,000** — use in one commercial project; no resale of IP; full source code included.
- **Bundle License (3–4 Projects): €18,000** — use in up to four commercial projects; no resale of IP; full source code included.
- **Full IP Buyout (All 13 Projects): €75,000 + 10% royalties** — full transfer of intellectual property, source code, layouts, and documentation; domain ojjja.xyz optional and negotiable; royalties negotiable.

AI provider API keys are not included. Buyer needs their own keys (OpenAI, Anthropic, Mistral, Replicate).

See [LICENSE.txt](LICENSE.txt) for the complete commercial license agreement.

---

## 💬 Support

- **Email:** mepaulaj@gmail.com
- **LinkedIn:** [Paulina Jakubowska](https://www.linkedin.com/in/paulina-jakubowska-65712b163)
- **Live demos:** https://ojjja.xyz

Support included with purchase:

- 30 days technical support
- Deployment guidance
- Bug fixes for reported issues

---

## 📄 File Structure

```text
incanto/
├── index.html                    # INCANTO OS (main dashboard)
├── README.md
├── LICENSE.txt
├── .env.example
├── .gitignore
├── thinklink/
├── perceptio/
├── neuromusic/
├── irisverify/
├── irisvault/
├── kobalt-html/
├── vibe-coder/
├── kobalt-automation/
├── asi-bridge/
├── crm-ai/
├── asystent-sprzedazy/
├── 45-mini-saas/
├── terraform/aws/                # ClusterLaunch
├── helm/
├── docs/
├── scripts/
└── assets/
```

---

## ⚠️ Important Notes

1. AI API keys are not included; buyers must provide their own.
2. Camera access requires HTTPS for IrisVerify and IrisVault.
3. ClusterLaunch deploys real AWS resources. Estimated demo-tier cost: $10–30/month.
4. The ojjja.xyz domain is optional and negotiable with the IP buyout.
5. The software is provided “as is” for commercial evaluation.

---

© 2026 Paulina Jakubowska · OJJJA.XYZ · INCANTO
