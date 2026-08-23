# Setup guide

Getting Rihlati running locally, from an empty folder to a working booking.

---

## 1. Requirements

| Tool | Version | Notes |
| ---- | ------- | ----- |
| Node.js | 20 or newer | `node -v` |
| PHP | 8.2 or newer | Laravel 13 will not run on 8.1 |
| Composer | 2.x | |
| MySQL / MariaDB | 5.7+ / 10.4+ | XAMPP ships one |

### Windows with XAMPP

XAMPP often ships an older PHP. Rather than replacing it — which would break
your other projects — install a second PHP alongside it:

1. Download the **NTS x64** build of PHP 8.3 from
   [windows.php.net](https://windows.php.net/download/) and extract it to
   `C:\php83`.
2. Copy `php.ini-development` to `php.ini` and enable these extensions by
   removing the leading `;`:
   `openssl`, `pdo_mysql`, `mbstring`, `fileinfo`, `curl`, `zip`, `intl`.
   Set `extension_dir = "C:\php83\ext"`.
3. Install Composer next to it:
   ```bash
   C:\php83\php.exe -r "copy('https://getcomposer.org/composer-stable.phar', 'C:\php83\tools\composer.phar');"
   ```

Apache keeps using XAMPP's PHP; only the API uses `C:\php83\php.exe`.

---

## 2. Clone

```bash
git clone https://github.com/mohamedAlkhatib5/Rihlati_airline.git
cd Rihlati_airline
```

---

## 3. Database

Start MySQL (the XAMPP control panel, or):

```bash
C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone
```

Create the database:

```sql
CREATE DATABASE rihlati CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 4. API

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
```

Open `.env` and set a JWT secret. Generate one with:

```bash
php -r "echo bin2hex(random_bytes(32));"
```

Then create the schema and load the demo data:

```bash
php artisan migrate --seed
```

This creates 25 airports and destinations, 8 aircraft, ~3,300 flights,
90 bookings with passengers and seats, 8 offers and the demo accounts.

Start it:

```bash
php artisan serve --port=8000
```

Check it is alive: <http://127.0.0.1:8000/api/v1/health>

---

## 5. Front-end

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open <http://localhost:5173>.

Vite proxies `/api` to `http://127.0.0.1:8000`, so the browser only ever talks
to one origin — no CORS surprises in development.

---

## 6. Demo accounts

| Role | Email | Password | Can |
| ---- | ----- | -------- | --- |
| Administrator | `admin@rihlati.demo` | `Admin@12345` | Everything, including create / edit / delete |
| Operations staff | `staff@rihlati.demo` | `Staff@12345` | Read the dashboard only |
| Customer | `omar.haddad@example.com` | `Traveller@123` | Book and manage their own trips |

Sign in at `/login`. Staff and admins land on the dashboard; customers return
to the site.

> These exist so the project can be explored. Delete `UserSeeder` or rotate the
> passwords before putting this anywhere public.

---

## 7. Try the whole flow

1. **Search** — go to `/flights`, enter `DXB` and `LHR`, pick a date a few days
   out, choose 2 passengers, search.
2. **Select** — pick a fare on the outbound, then on the return. The bar at the
   bottom shows the running total.
3. **Travellers** — names and a contact email are required.
4. **Seats** — pick a seat per traveller, or skip and they are assigned.
5. **Pay** — any card number starting `4242` passes the demo validation.
6. **Confirmation** — you get a real booking reference (PNR). The confirmation
   email is written to `server/storage/logs/laravel.log` because
   `MAIL_MAILER=log`.
7. **Manage** — go to `/manage-booking`, enter the reference and the email you
   used. You can cancel from there; seats return to inventory and the payment
   is marked refunded.
8. **Dashboard** — sign in as admin, open **Flights**, and use the people icon
   on any row to see that flight's passenger list with seat numbers.

---

## 8. Images

Destination photographs are generated, not committed at full size.

```bash
cd client
npm run images:fetch    # downloads originals from Wikimedia Commons
npm run images:build    # emits 640/1280/1920 WebP + JPEG fallback
```

To add your own: drop a file in `client/src/assets/images-src/` named after the
destination's `image` field, then run `npm run images:build`.

---

## 9. Common problems

**`could not find driver`** — `pdo_mysql` is not enabled in the `php.ini` your
CLI is using. Check with `php --ini`.

**Search returns nothing** — the seeder generates 45 days of schedule from the
day it ran. Re-run `php artisan migrate:fresh --seed` if the data has aged out.

**401 on every dashboard request** — `JWT_SECRET` is empty in `.env`. Set it and
run `php artisan config:clear`.

**Vite starts on 5174** — port 5173 was busy. The proxy still works; just use
the port Vite prints.
