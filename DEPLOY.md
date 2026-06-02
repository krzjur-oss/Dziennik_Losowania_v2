# 🚀 Instrukcja publikacji na GitHub Pages

Dziennik Losowania został w pełni przygotowany do bezproblemowego działania na **GitHub Pages**. Wprowadziliśmy następujące zmiany:
1. **Relatywne ścieżki (`base: './'`)**: Zapewnia to poprawne ładowanie obrazów, skryptów oraz stylów CSS bez względu na to, czy aplikacja jest wdrożona w głównej domenie, czy w podfolderze (np. `https://twoj-login.github.io/nazwa-repozytorium/`).
2. **Automatyczne wdrażanie (GitHub Actions)**: Dodano plik konfiguracji `.github/workflows/deploy.yml`, który automatycznie skompiluje i opublikuje aplikację po każdym wypchnięciu zmian (`git push`).
3. **Wdrażanie ręczne**: Zainstalowano moduł `gh-pages` oraz dodano wygodny skrypt `npm run deploy` w `package.json`.

Poniżej znajdziesz instrukcję krok po kroku, jak opublikować aplikację.

---

## 🛠️ Opcja A: Automatyczne wdrażanie przez GitHub Actions (Zalecane)

Sposób ten jest najwygodniejszy – każda zmiana w kodzie wypchnięta na GitHub automatycznie zaktualizuje Twoją stronę internetową w ciągu kilkudziesięciu sekund.

### Krok 1: Utwórz repozytorium na GitHubie
1. Zaloguj się na GitHubie i kliknij **New repository** (Nowe repozytorium).
2. Nazwij je (np. `dziennik-losowania`) i kliknij **Create repository** (Nie zaznaczaj dodawania pliku README, .gitignore ani licencji).

### Krok 2: Zainicjalizuj Git lokalnie i wyślij kod
Otwórz terminal w folderze projektu na swoim komputerze i wykonaj:
```bash
# Inicjalizacja gita
git init

# Dodanie wszystkich plików
git add .

# Pierwszy commit
git commit -m "feat: przygotowanie do publikacji na GitHub Pages"

# Zmiana nazwy głównej gałęzi na main
git branch -M main

# Połączenie lokalnego folderu z Twoim repozytorium na GitHubie
# (Zastąp <twoj-login> oraz <nazwa-repozytorium> swoimi danymi)
git remote add origin https://github.com/<twoj-login>/<nazwa-repozytorium>.git

# Wypchnięcie plików na GitHub
git push -u origin main
```

### Krok 3: Włącz uprawnienia zapisu dla GitHub Actions (Wymagane!)
Aby mechanizm GitHub Actions miał uprawnienie do utworzenia specjalnej gałęzi wdrożeniowej `gh-pages`:
1. Wejdź w ustawienia swojego repozytorium na GitHubie: **Settings** (górna belka).
2. Wybierz z menu po lewej stronie: **Actions** -> **General**.
3. Zjedź na sam dół do sekcji **Workflow permissions**.
4. Zaznacz opcję **Read and write permissions** (Uprawnienia do odczytu i zapisu).
5. Kliknij **Save**.

### Krok 4: Konfiguracja zakładki GitHub Pages
1. Po udanym uruchomieniu i zakończeniu zadania w zakładce **Actions** (pojawi się tam zielony ptaszek), wejdź w **Settings** repozytorium.
2. Wybierz po lewej stronie zakładkę **Pages**.
3. W sekcji **Build and deployment** upewnij się, że źródłem (Source) jest **Deploy from a branch**.
4. Pod spodem, jako **Branch** wybierz: `gh-pages` oraz folder `/ (root)`.
5. Kliknij **Save**.

Po kilku chwilach na górze strony ukaże się bezpośredni link do Twojego działającego online Dziennika Losowania!

---

## 💻 Opcja B: Ręczne wdrażanie za pomocą terminala

Jeśli wolisz wdrażać wersje produkcyjne ręcznie ze swojego komputera:

1. Po skonfigurowaniu zdalnego repozytorium (Krok 2 powyżej) upewnij się, że masz zainstalowane wszystkie zależności:
   ```bash
   npm install
   ```
2. Uruchom jedno proste polecenie w terminalu:
   ```bash
   npm run deploy
   ```
   *To polecenie automatycznie wygeneruje najnowszy zoptymalizowany build do folderu `dist/` (`npm run build`) oraz prześle go bezpośrednio na gałąź `gh-pages` na Twoim koncie GitHub.*
3. Następnie postępuj zgodnie z **Krokiem 4** powyżej, aby wskazać gałąź `gh-pages` w panelu GitHub Pages.

---

## 🔒 Co z moimi danymi i klasami?
Wszystkie dane dodanych klas, stan obecności, historie losowań, statystyki oraz ustawienia językowe są bezpiecznie zapisywane w pamięci **LocalStorage** przeglądarki użytkownika.
* **Pełne bezpieczeństwo**: Dane nigdy nie opuszczają Twojego urządzenia ani przeglądarki i nie są przesyłane na serwer zewnętrzny.
* **Nienaruszone aktualizacje**: Kolejne aktualizacje strony i kodu przez GitHub Pages nie powodują utraty zapisanych danych uczniów i konfigurowanych klas!
