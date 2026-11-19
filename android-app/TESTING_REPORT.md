# Smart Daily Hisab — Testing & Verification Report

## 1. Security & PIN Lock Verification
- **4-digit & 6-digit PIN Setup**: Verified PIN length selection, confirmation mismatch rejection, and salted PBKDF2WithHmacSHA256 / SHA-256 hash storage.
- **No Plain-Text PIN**: Verified only cryptographic salt + hash are persisted (`EncryptedSharedPreferences` with `AndroidKeyStore` AES-256-GCM on Android; Web Crypto salted SHA-256 locally in PWA).
- **Auto-Lock on Background**: Verified `ProcessLifecycleOwner` (`onStop`) on Android and `visibilitychange` (`hidden`) in the live PWA lock the ledger immediately upon returning from background.
- **Forgot PIN & Change PIN**: Verified recovery via security question answer and 12-character recovery key without deleting stored transactions.

## 2. Financial Calculations & Validation
- **Zero/Negative Prevention**: Amounts `<= 0` or `NaN` are rejected with localized validation errors.
- **Automatic Recalculation**:
  - `Total Income = Σ income transactions`
  - `Total Expenses = Σ expense transactions`
  - `Available Balance = Opening Balance + Total Income - Total Expenses`
- Verified live updates across Dashboard, History, Reports, and Charts after Add, Edit, and Delete actions.

## 3. Multilingual Unicode Rendering
- **Gujarati (Default)**, **Hindi**, and **English** tested across navigation tabs, categories (16 expense + 7 income), reports, validation errors, and PDF/CSV exports (UTF-8 BOM for CSV + Unicode canvas rendering for PDF).

## 4. Offline Persistence & Backup/Restore
- Verified full offline functionality without network connectivity.
- Tested JSON backup export, schema validation, and safe restore without duplicate corruption.
