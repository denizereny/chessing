# Tam i18n Kapsamı - Gereksinimler

## 1. Genel Bakış

4x5 Satranç Pro uygulamasındaki tüm UI öğelerinde eksiksiz uluslararasılaştırma kapsamı sağlanması. Uygulama şu anda 11 dili desteklemektedir (İngilizce, Türkçe, İspanyolca, Fransızca, Almanca, İtalyanca, Rusça, Çince, Japonca, Portekizce, Arapça) ancak çeviri kapsamında eksiklikler olabilir.

## 2. User Stories

### 2.1 As a non-English speaker
I want all UI text to be translated into my language so that I can fully understand and use the application without language barriers.

### 2.2 As a developer
I want a systematic way to identify missing translations so that I can ensure complete i18n coverage across all features.

### 2.3 As a user switching languages
I want all text elements to update immediately when I change the language setting so that the interface is consistent.

## 3. Acceptance Criteria

### 3.1 Translation Coverage Audit
- All visible text in index.html must have corresponding translation keys
- All dynamically generated text must use the translation system
- All JavaScript-generated UI elements must be translatable
- All modal dialogs and overlays must support translations
- All button labels, tooltips, and aria-labels must be translated

### 3.2 Translation Key Consistency
- Translation keys must follow a consistent naming convention
- All supported languages must have the same set of translation keys
- No hardcoded text strings should exist in HTML or JavaScript

### 3.3 Missing Translation Detection
- System must identify HTML elements with hardcoded text
- System must identify translation keys present in some languages but missing in others
- System must report untranslated elements to developers

### 3.4 Translation Completeness
- English (en): 100% complete (reference language)
- Turkish (tr): 100% complete
- Spanish (es): 100% complete
- French (fr): 100% complete
- German (de): 100% complete
- Italian (it): 100% complete
- Russian (ru): Must be verified and completed
- Chinese (zh): Must be verified and completed
- Japanese (ja): Must be verified and completed
- Portuguese (pt): Must be verified and completed
- Arabic (ar): Must be verified and completed with RTL support

### 3.5 Dynamic Content Translation
- Settings menu items must be fully translated
- Piece setup modal content must be fully translated
- Color panel labels must be fully translated
- Game status messages must be fully translated
- Error and success messages must be fully translated

## 4. Technical Requirements

### 4.1 Translation File Structure
- Maintain existing translations.js structure
- Ensure all language objects have identical key sets
- Support nested translation objects for organization

### 4.2 HTML Integration
- Use data-i18n attributes for static HTML elements
- Use id-based translation for dynamic elements
- Ensure all user-facing text is translatable

### 4.3 JavaScript Integration
- All UI-generating JavaScript must use translation functions
- Dynamic messages must support parameter substitution
- Translation updates must trigger UI refresh

### 4.4 Accessibility
- Translated aria-labels for screen readers
- Translated aria-descriptions for complex UI elements
- Language-specific text direction support (LTR/RTL)

## 5. Out of Scope

- Adding new languages beyond the existing 11
- Translating code comments or developer documentation
- Translating external library content
- Automatic machine translation (manual translation required)

## 6. Success Metrics

- 100% of visible UI text is translatable
- 0 hardcoded text strings in production code
- All 11 languages have complete translation coverage
- Language switching updates all UI elements instantly
- No console errors related to missing translation keys

## 7. Dependencies

- Existing translations.js file
- Existing language switching mechanism
- HTML elements with proper id attributes
- JavaScript UI generation functions

## 8. Risks and Mitigations

### Risk: Incomplete translations in less common languages
**Mitigation**: Create translation audit tool to identify gaps

### Risk: New features added without translations
**Mitigation**: Establish development workflow requiring translation keys

### Risk: Translation key naming conflicts
**Mitigation**: Use namespaced key structure (e.g., menu.settings.title)

## 9. Notes

- The application already has a robust translation system in place
- Focus is on identifying and filling gaps, not rebuilding the system
- Priority languages: English, Turkish, Spanish (most commonly used)
- RTL support for Arabic requires special CSS considerations
