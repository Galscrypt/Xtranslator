# X Translator

Расширение для автоматического перевода постов на русский язык на:
- `axiom.trade`
- `trade.padre.gg`

## Что умеет

- Автоматически переводит посты на поддерживаемых сайтах.
- По клику по переводу показывает оригинал, по повторному клику возвращает перевод.
- Использует несколько API-провайдеров с fallback (если один недоступен, пробует следующий).
- Кэширует переводы для ускорения повторных открытий.
- Поддерживает пользовательский словарь (сленг, аббревиатуры, пост-фиксы).

## Установка (Chrome)

1. Скачай или клонируй проект.
2. Открой `chrome://extensions/`.
3. Включи `Режим разработчика` (переключатель справа вверху).
4. Нажми `Загрузить распакованное расширение`.
5. Выбери папку проекта (где находится `manifest.json`).

После установки открой `axiom.trade` или `trade.padre.gg` — перевод начнет работать автоматически.

## Использование

- Включение/выключение: через popup расширения.
- Показать оригинал: клик по переведенному тексту.
- Вернуть перевод: повторный клик.

## Пользовательский словарь

В popup есть блок `Custom Glossary (JSON)`:
- `Load glossary` — загрузить текущий словарь из локального хранилища.
- `Apply glossary` — применить словарь.

Актуальную версию словаря удобно хранить в файле:
- [GLOSSARY.md](/c:/Users/MI/Desktop/Xtranslate/GLOSSARY.md)

Рекомендуемый процесс:
1. Обновляешь JSON в `GLOSSARY.md`.
2. Копируешь его в popup.
3. Нажимаешь `Apply glossary`.

## Кнопки Advanced

- `Reset slang log` — очистить лог неизвестных слов/сленга.
- `Reset API rank` — сбросить статистику ранжирования провайдеров.
- `Reset custom glossary` — удалить пользовательский словарь и вернуть базовый.
- `Reset feature flags` — вернуть feature-флаги к значениям по умолчанию.

## Baseline QA

Для проверки качества до/после изменений:
- `baseline/README.md`
- `baseline/baseline_cases.csv`

## Runtime-команды (для диагностики)

Поддерживаемые типы сообщений:
- `GET_STATUS`
- `GET_DIAGNOSTICS`
- `GET_UNKNOWN_TERMS`
- `RESET_UNKNOWN_TERMS`
- `RESET_PROVIDER_PERF`
- `SET_FEATURE_FLAGS`
- `RESET_FEATURE_FLAGS`
- `GET_CUSTOM_GLOSSARY`
- `SET_CUSTOM_GLOSSARY`
- `RESET_CUSTOM_GLOSSARY`

Пример payload для `SET_CUSTOM_GLOSSARY`:

```json
{
  "glossary": {
    "PRESERVE_TERMS": ["sendit", "jeet"],
    "EXPAND_ABBREVIATIONS": { "rn": "right now" },
    "CRYPTO_SLANG_MAP": { "cooked": "ruined" },
    "POST_TRANSLATION_FIXES": { "технический документ": "вайтпейпер" }
  }
}
```

## Feature-флаги

Основные флаги в `axiom/constants.js` и `padre/constants.js`:
- `ENABLE_QUALITY_GATE`
- `ENABLE_OBSERVER_TEXT_QUALITY_FILTER`
- `ENABLE_OBSERVER_LINE_CLEANUP`
- `ENABLE_SLANG_EXPANSION`
- `ENABLE_POST_FIXES`
- `ENABLE_DYNAMIC_PROVIDER_ORDER`

## Известные проблемы

- В редких случаях у длинных многострочных постов часть текста может обрезаться при извлечении из DOM.
- Это не влияет на большинство постов и не ломает работу расширения целиком.
- Если встретился такой кейс, лучше ориентироваться на оригинал поста и прислать пример для точечного исправления.
