# X Translator

Расширение для автоматического перевода постов на русский язык на сайтах:
- `axiom.trade`
- `trade.padre.gg`

## Что умеет

- Автоматически переводит посты на поддерживаемых сайтах.
- По клику по переводу показывает оригинал (повторный клик возвращает перевод).
- Использует несколько API-провайдеров с fallback.
- Кэширует переводы для ускорения повторных открытий.
- Поддерживает пользовательский глоссарий (JSON) через popup.

## Установка (Chrome)

1. Открой `chrome://extensions/`.
2. Включи `Режим разработчика`.
3. Нажми `Загрузить распакованное расширение`.
4. Выбери папку проекта (где лежит `manifest.json`).

## Custom Glossary (JSON)

В popup есть блок `Custom Glossary (JSON)`:
- `Load glossary` — загрузить текущий словарь из storage.
- `Apply glossary` — применить словарь.

Рекомендуется хранить рабочий JSON в [GLOSSARY.md](/c:/Users/MI/Desktop/Xtranslate/GLOSSARY.md).

## Advanced кнопки

- `Reset slang log` — очистить лог неизвестных терминов.
- `Reset API rank` — сбросить рейтинг провайдеров.
- `Reset custom glossary` — удалить кастомный словарь.
- `Reset feature flags` — вернуть feature-флаги по умолчанию.

## Feature-флаги

Основные флаги в `axiom/constants.js` и `padre/constants.js`:
- `ENABLE_QUALITY_GATE`
- `ENABLE_OBSERVER_TEXT_QUALITY_FILTER`
- `ENABLE_OBSERVER_LINE_CLEANUP`
- `ENABLE_SLANG_EXPANSION`
- `ENABLE_POST_FIXES`
- `ENABLE_DYNAMIC_PROVIDER_ORDER`

## Обновление 2026-03-21 (Safety)

Добавлены обязательные защитные улучшения:
- лимиты fallback: `MAX_PROVIDERS_PER_REQUEST`, `MAX_QUALITY_FALLBACK_ATTEMPTS`, `MAX_REQUEST_MS`;
- безопасные границы glossary-замен (чтобы не ломать части слов);
- decay + controlled explore для рейтинга провайдеров.

## Baseline QA

Материалы для проверки качества:
- `baseline/README.md`
- `baseline/baseline_cases.csv`
- `baseline/baseline_runs.csv`

## Known issue

В редких случаях длинные многострочные посты могут частично обрезаться при извлечении из DOM.
