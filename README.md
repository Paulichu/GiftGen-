# Emergent Studio — Full-Stack AI App Builder & Persistent Agent

An open-source alternative to `app.emergent.sh` ("Emergent Studio"). Transform natural language prompts into production-ready software prototypes with automated multi-agent architecture and a 24/7 Persistent Agent living on Telegram and WhatsApp.

---

## 🏗 Architecture

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
  - Interactive Landing Page (`/`) with live platform statistics counter.
  - Multi-agent Builder (`/builder`) featuring Project Explorer, 5-agent sequential conversation pipeline (Architect, Designer, Developer, Integration, PM), Live Preview sandbox iframe with hot-reload, Code Inspector, and terminal logs.
  - **Standalone Engine:** Seamless client-side fallback in `src/lib/api.ts` that prevents auth lockouts and enables browser simulation when deployed independently (e.g. on Vercel).
  - **Capacitor 6 Android:** Ready-to-build Android project in `frontend/android/` with dark status bar, splash screen, and push notifications.
- **Backend:** FastAPI (Python 3.11) with Motor (async MongoDB)
  - Modular routers for Auth (JWT & bcrypt), Projects, Versions (Rollback & Fork), Stats, and Multi-Agent Generation.
  - **Persistent Agent (`/api/agent`):** Always-on assistant powered by OpenAI `gpt-4o-mini` with MongoDB function calling (`check_availability`, `create_booking`, `get_bookings`), Telegram bot webhook (`/webhook/telegram`), Meta WhatsApp Cloud API (`/webhook/whatsapp`), and direct chat (`/chat`).
  - **Deployment Ready:** Configured for Railway deployment via `railway.json` and `backend/railway.toml` with `/health` healthcheck endpoint.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root and fill in the values:

| Variable | Description | Default / Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/emergent` |
| `USE_MOCK_MONGO` | Use in-memory `mongomock-motor` | `0` (or `1` for tests) |
| `JWT_SECRET` | Secret key for JWT auth tokens | `super_secret_jwt_key_...` |
| `OPENAI_API_KEY` | OpenAI API key for generation & persistent agent | `sk-...` |
| `TELEGRAM_BOT_TOKEN`| Bot token from @BotFather for 24/7 Telegram bot | `123456:ABC...` |
| `WHATSAPP_TOKEN` | Meta WhatsApp Cloud API access token | `EAAX...` |
| `WHATSAPP_PHONE_ID`| Meta WhatsApp phone number ID | `10023456789` |
| `WEBHOOK_SECRET` | Verify token for WhatsApp webhook | `emergent_webhook_secret` |
| `NEXT_PUBLIC_API_URL`| Backend URL consumed by frontend | `http://localhost:8000` |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array or comma-separated) | `["http://localhost:3000","https://frontend-84ui.vercel.app"]` |
| `PORT` | Backend port (Railway / Docker) | `8000` |

---

## 🚀 Quickstart / Jak uruchomić

### 1. Szybki start przez Docker Compose (Zalecane / Recommended)

Jedno polecenie uruchamia bazę MongoDB, backend FastAPI oraz frontend Next.js:

```bash
# 1. Kopiowanie pliku zmiennych środowiskowych
cp .env.example .env

# 2. Uruchomienie wszystkich kontenerów
docker-compose up --build
```

- **Frontend (Aplikacja WWW):** `http://localhost:3000`
- **Backend API Docs (Swagger):** `http://localhost:8000/docs`
- **Healthcheck & Status Agenta:** `http://localhost:8000/health`

---

### 2. Uruchomienie lokalne (Manualne krok po kroku)

#### A. Backend (FastAPI + Python):
```bash
cd backend

# Utworzenie i aktywacja środowiska wirtualnego (opcjonalnie)
python3 -m venv venv
source venv/bin/activate  # na Windows: venv\Scripts\activate

# Instalacja zależności
pip install -r requirements.txt

# Start serwera API (z auto-reloadem)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Domyślnie, jeśli nie ma lokalnej bazy MongoDB, aplikacja automatycznie używa pamięciowego mocka `mongomock-motor` (`USE_MOCK_MONGO=1`), więc backend startuje natychmiast bez dodatkowej konfiguracji!*

#### B. Frontend (Next.js 14):
W nowym oknie terminala:
```bash
cd frontend

# Instalacja pakietów
npm install

# Tryb developerski
npm run dev
```
Aplikacja dostępna pod adresem: `http://localhost:3000`.

---

### 3. Uruchomienie 24/7 Agenta Telegram (Tryb Polling / Bez publicznego IP)

Jeśli posiadasz token od `@BotFather` i chcesz testować bota na Telegramie bez konieczności wystawiania publicznego adresu HTTPS dla webhooka:
```bash
cd backend
export TELEGRAM_BOT_TOKEN="twój_token_od_botfather"
python -m app.telegram_bot_polling
```
Bot natychmiast nasłuchuje na Telegramie i zarządza rezerwacjami w MongoDB w czasie rzeczywistym.

---

### 4. Uruchomienie w Termux na Androidzie — 100% Real (BEZ SYMULACJI, BEZ MOCKÓW) 📲

Całość działa w 100% na prawdziwym backendzie, prawdziwym modelu OpenAI (`gpt-4o-mini`), prawdziwej bazie MongoDB (Atlas lub lokalna) i prawdziwym bocie Telegram / WhatsApp.

#### Krok 1: Przygotowanie pakietów w Termux
Otwórz aplikację Termux na Androidzie:
```bash
# Aktualizacja repozytoriów i instalacja pakietów systemowych
pkg update -y && pkg upgrade -y
pkg install -y git python nodejs-lts clang make build-essential tmux
termux-wake-lock
```
*(Polecenie `termux-wake-lock` blokuje wygaszanie procesora w Androidzie — bot i backend działają nieprzerwanie 24/7).*

#### Krok 2: Klonowanie repozytorium
```bash
git clone <URL_REPOZYTORIUM> emergent-studio
cd emergent-studio
```

#### Krok 3: Prawdziwa konfiguracja środowiska (.env) — BEZ MOCKÓW
```bash
cp .env.example .env
nano .env  # lub edytuj w ulubionym edytorze
```
W pliku `.env` ustaw prawdziwe wartości produkcyjne:
```env
USE_MOCK_MONGO=0
MONGODB_URI=mongodb+srv://user:haslo@twoj-klaster.mongodb.net/emergent?retryWrites=true&w=majority
OPENAI_API_KEY=sk-proj-twoj_prawdziwy_klucz_openai
TELEGRAM_BOT_TOKEN=twój_prawdziwy_token_od_botfather
NEXT_PUBLIC_API_URL=http://localhost:8000
```
*(Baza MongoDB: darmowy stały klaster na mongodb.com Atlas — 0 zł na zawsze, idealny do Termux).*

#### Krok 4: Instalacja i start prawdziwego Backendu (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Start backendu z prawdziwym połączeniem do MongoDB i OpenAI:
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```
Sprawdzenie statusu połączenia:
```bash
curl http://localhost:8000/health
# Zwraca: {"status":"ok","persistent_agent":"online","credits":"infinite"}
```

#### Krok 5: Start Prawdziwego Agenta Telegram (24/7 Polling)
W tym samym oknie lub w sesji tmux:
```bash
python -m app.telegram_bot_polling &
```
Agent jest teraz natychmiast aktywny na Twoim koncie Telegram: rozmawia przez OpenAI i zapisuje rzeczywiste rezerwacje do Twojej bazy MongoDB!

#### Krok 6: Instalacja i start Frontendu (Next.js 14)
Otwórz nową sesję Termux (przesuń palcem od lewej krawędzi -> New Session):
```bash
cd emergent-studio/frontend
npm install
npm run dev -- -H 0.0.0.0 -p 3000
```

#### Krok 7: Korzystanie na telefonie
Otwórz przeglądarkę na telefonie (Chrome/Brave/Firefox) i wpisz:
`http://localhost:3000`

Wszystkie zapytania trafiają do Twojego lokalnego serwera FastAPI, bazy MongoDB i OpenAI — zero mocków, zero symulacji.

---

## 📱 Android Build (Capacitor 6)

The frontend is wrapped with Capacitor without custom Kotlin or Java code:
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```
In Android Studio: **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
PYTHONPATH=. pytest tests/ -v

# Run frontend build (Static Export)
cd frontend
npm run build
```
