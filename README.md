# Nazwa kursu
Testowanie i Jakość Oprogramowania

# Autor
Black Ghost

# Temat projektu
System uruchamiania zadań

# Opis projektu
OlimpCTF to kompleksowa platforma CTF przeznaczona do hostowania wyzwań z zakresu cyberbezpieczeństwa. Projekt składa się z czterech głównych komponentów:

- **Frontend** - Interfejs użytkownika dla uczestników zawodów CTF
- **AdminPanel** - Panel administracyjny do zarządzania zadaniami, kategoriami i użytkownikami
- **Backend** - Serwer API do zarządzania użytkownikami, zadaniami, kategoriami i logami
- **TaskRunner** - Serwer do uruchamiania zadań w kontenerach Docker oraz weryfikacji flag

Platforma umożliwia dynamiczne tworzenie kategorii wyzwań, zarządzanie zadaniami, izolowane wykonywanie kodu w kontenerach Docker oraz system weryfikacji flag.

# Uruchomienie projektu

## Wymagania wstępne
- Node.js
- npm
- TypeScript (`sudo npm install -g ts-node`)
- Docker i Docker Compose

## Konfiguracja początkowa
1. Przejdź do `TaskRunner/api` i zmień nazwę `.env.example` na `.env`
2. Dodaj bezpieczny klucz do AES w pliku `.env`

## Uruchomienie

### Docker
```bash
docker-compose up --build
```

Aby zatrzymać:
```bash
docker-compose down
```

# Testy

## Frontend

Testy jednostkowe i integracyjne - **34 testy** (Karma/Jasmine).

### Uruchomienie
```bash
cd Frontend
CHROME_BIN=/bin/chromium npm test -- --include='**/challenge.service.spec.ts' --watch=false --browsers=ChromeHeadless
CHROME_BIN=/bin/chromium npm test -- --include='**/task-view.component.spec.ts' --watch=false --browsers=ChromeHeadless 
```

```bash
npm test -- --include='**/challenge.service.spec.ts' --watch=false --browsers=ChromeHeadless
```

### ChallengeService - Testy jednostkowe (17)
1. should be created
2. should verify flag with correct task ID and flag
3. should handle incorrect flag submission
4. should retrieve tasks for a specific category
5. should return empty array when category has no tasks
6. should retrieve category details by nicename
7. should retrieve all categories
8. should handle empty categories list
9. should start container for a task
10. should handle container start failure
11. should stop container for a task
12. should handle container stop failure
13. should retrieve task details by ID
14. should download task file as blob
15. should handle different file types
16. verifyFlag - should verify flag with correct task ID and flag
17. downloadTaskFile - should handle different file types

### TaskViewComponent - Testy integracyjne (17)
1. should create
2. should load task details on initialization
3. should set container info when container is running
4. should handle task details loading error
5. should verify correct flag and show success alert
6. should verify incorrect flag and show error message
7. should handle flag verification error
8. should start container successfully
9. should handle container start error
10. should not start container when task ID is missing
11. should stop container successfully
12. should handle container stop error
13. should not stop container when task ID is missing
14. should download file successfully
15. should handle download error
16. should not download file when task ID is missing
17. should emit close event when onCloseClick is called
18. should toggle hints visibility
19. should toggle hints multiple times

## Backend

Testy jednostkowe i integracyjne - **42 testy** (Jest).

### Uruchomienie
```bash
cd Backend/api
npm test
```

### ChallengeController - Testy integracyjne (23)
1. should return all categories successfully
2. should handle service error when fetching categories
3. should return category details by nicename
4. should return 400 when nicename is missing
5. should return 404 when category not found
6. should return tasks for a category
7. should return 400 when category is missing
8. should handle service error
9. should verify correct flag successfully
10. should reject incorrect flag
11. should return 400 when flag is missing
12. should return 400 when task_id is missing
13. should handle service error during verification
14. should start container successfully
15. should return 400 when task_id is missing (start container)
16. should handle container start error
17. should stop container successfully
18. should return 400 when task_id is missing (stop container)
19. should handle container stop error
20. should return task details
21. should handle task details error
22. should download file successfully
23. should return 404 when file not found

### ChallengeService - Testy jednostkowe (19)
1. should retrieve category by nicename
2. should handle category not found
3. should retrieve all categories
4. should return empty array when no categories exist
5. should retrieve tasks for a category and user
6. should throw error when user not found
7. should verify correct flag and save completion for first solve
8. should verify correct flag but not save if already completed
9. should return false for incorrect flag
10. should not save completion if user not found
11. should add task to both database and task runner
12. should handle add task error
13. should delete task from both database and task runner
14. should handle delete task error gracefully
15. should create new category with all details
16. should update existing category
17. should retrieve all tasks from database
18. should add task to database only
19. should throw error if database add fails

## Playwright

Testy E2E - **13 testów** automatycznych.

### Uruchomienie
```bash
cd Playwright
npm install
npx playwright install
cp .env.example .env  # Skonfiguruj dane testowe
npx playwright test
```

### Lista testów (13)
1. Should display task details when task is clicked
2. Should display task metadata correctly
3. Should allow flag submission with input
4. Should disable submit button when flag input is empty
5. Should handle flag submission
6. Should show container controls for tasks with container support
7. Should start container when button is clicked
8. Should display container URL when container is running
9. Should stop container when stop button is clicked
10. Should show file download buttons when files exist
11. Should close task view when close button is clicked
12. Should close task view when clicking backdrop
13. Should redirect to login when accessing tasks without authentication

[//]: # (Szczegóły: [Playwright/README.md]&#40;Playwright/README.md&#41;)


# Dokumentacja API

Dokumentacja API jest dostępna poprzez **Swagger UI**.

## Backend API
Po uruchomieniu serwera Backend, dokumentacja Swagger dostępna jest pod adresem:
```
http://localhost:5000/swagpag
```

# Przypadki testowe dla testera manualnego

**15 przypadków testowych manualnych**

### Lista przypadków testowych
1. **Wyświetlanie szczegółów zadania** - sprawdzenie poprawnego wyświetlania nazwy, opisu, punktów, kategorii, plików i kontrolek kontenera
2. **Przesłanie poprawnej flagi** - weryfikacja akceptacji prawidłowej flagi, aktualizacji punktów i oznaczenia zadania jako rozwiązane
3. **Przesłanie niepoprawnej flagi** - sprawdzenie komunikatu błędu, brak zmiany punktów, możliwość ponownej próby
4. **Przesłanie pustej flagi** - walidacja formularza, brak wysłania żądania do serwera
5. **Uruchomienie kontenera zadania** - start kontenera, wyświetlenie URL i czasu wygaśnięcia, zmiana statusu na "running"
6. **Zatrzymanie działającego kontenera** - poprawne zatrzymanie, usunięcie URL, zmiana statusu na "not_found"
7. **Uruchomienie kontenera po osiągnięciu limitu** - komunikat o błędzie limitu, brak tworzenia nowego kontenera
8. **Pobranie pliku zadania** - poprawne pobranie pliku, sprawdzenie nazwy i integralności pliku
9. **Pobranie nieistniejącego pliku** - komunikat błędu "File not found", brak pobierania uszkodzonego pliku
10. **Wyświetlanie kategorii zadań** - lista wszystkich kategorii z nazwami, ikonami, liczbą zadań
11. **Wyświetlanie zadań w konkretnej kategorii** - lista zadań z nazwami, punktami, statusem rozwiązania
12. **Automatyczne odświeżanie statusu kontenera** - aktualizacja statusu wygasłych kontenerów
13. **Wielokrotne próby przesłania flagi** - niezależna ocena każdego przesłania, możliwość ostatecznego sukcesu
14. **Obsługa błędów ładowania szczegółów zadania** - przyjazny komunikat błędu, możliwość ponowienia, brak zawieszenia aplikacji
15. **Współbieżne operacje na kontenerach** - synchronizacja stanu między kartami, brak duplikacji kontenerów

# Technologie użyte w projekcie

- **Docker & Docker Compose** - konteneryzacja aplikacji

## Frontend
- **Angular** - framework aplikacji
- **TypeScript** - język programowania
- **auth0** - obsługa JWT

## AdminPanel
- **Angular** - framework aplikacji
- **TypeScript** - język programowania
- **PrimeNG** - biblioteka komponentów UI
- **auth0** - obsługa JWT

## Backend
- **Express.js** - framework serwera
- **TypeScript** - język programowania
- **PostgreSQL** - baza danych
- **bcrypt** - hashowanie haseł
- **jsonwebtoken** - autentykacja JWT
- **Swagger** - dokumentacja API
- **Multer** - obsługa upload plików

## TaskRunner
- **Express.js** - framework serwera
- **TypeScript** - język programowania
- **Docker** - konteneryzacja i izolacja zadań
- **Node.js** - środowisko uruchomieniowe
- **PostgreSQL** - baza danych


---

.


.


.


.


.


.


.


.


.


.


.



.

.


.

.



.



.




---


# OlimpCTF

![Logo](Frontend/public/favicon.ico)

OlimpCTF is a Capture The Flag (CTF) platform designed for hosting cybersecurity challenges across various categories.


# Content

- [Start project](#start-project)
  - [Frontend](#frontend)
  - [AdminPanel](#adminpanel)
  - [Backend](#backend)
  - [Docker](#docker)
- [Categories](#categories)


# First start

1. Go to `TaskRunner/api` and rename `.env.example` to `.env`. Add secure key to AES.


# Start project

Install TS:

```bash
  sudo npm install -g ts-node
```

Run all:
```bash
./run.sh
```

## Frontend

**Framework:** Angular

To run the frontend:
```bash
  cd Frontend
  ng serve
```

## AdminPanel

**Framework:** Angular

To run the admin panel:
```bash
  cd AdminPanel
  ng serve
```

## Backend

Server for managing users, tasks, categories, and logs.

**Framework:** Express.js

To run the backend API:
```bash
  cd Backend/api
  npm install
  npm run start
```

### API

Documentation on Swagger.

## TaskRunner

Server to run tasks in docker containers. And server for checking flags.

**Framework:** Express.js

To run the task-runner API:
```bash
  cd TaskRunner/api
  npm install
  npm run start
```

## Docker

To run the full stack using Docker:
```bash
  docker-compose up --build
```

To stop
```bash
  docker-compose down
```

## Categories

### Dynamic for database


```TABLE categories```
