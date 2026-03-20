# Baseline Evaluation

Этот набор нужен для измерения качества перевода "до/после" изменений.

## Файлы
- `baseline/baseline_cases.csv` — кейсы для проверки (стартовый набор, 60 кейсов).
- `baseline/baseline_runs.csv` — журнал прогонов и оценок.

## Как использовать
### 0) Создать шаблон прогона

Чтобы не заполнять `baseline_runs.csv` вручную по `case_id`, создай шаблон:

```powershell
powershell -ExecutionPolicy Bypass -File baseline/create_run_template.ps1 -RunName after_current_build
```

Это добавит по одной строке на каждый кейс с пустыми полями для оценки.

Если нужно перезаписать существующий run с тем же именем:

```powershell
powershell -ExecutionPolicy Bypass -File baseline/create_run_template.ps1 -RunName after_current_build -ReplaceExisting
```

### 1) Пройти кейсы и заполнить оценки
1. Включи расширение на `axiom.trade` и `trade.padre.gg`.
2. Пройди кейсы из `baseline_cases.csv`.
3. Для каждого кейса заполни в `baseline_runs.csv`:
   - `run_name` (например `before_v1_dict` или `after_v1_dict`)
   - `case_id`
   - `actual_ru`
   - `ticker_preserved` (`1/0`)
   - `slang_correct` (`1/0`)
   - `garbage` (`1/0`)
   - `score_1_5` (человеческая оценка)
   - `notes`
4. Сравни агрегаты между прогонами:
   - average `score_1_5`
   - `% ticker_preserved=1`
   - `% slang_correct=1`
   - `% garbage=1` (должно снижаться)
5. Быстрый подсчет можно сделать скриптом:
   - `powershell -ExecutionPolicy Bypass -File baseline/calc_metrics.ps1`
   - сравнение двух прогонов:
     `powershell -ExecutionPolicy Bypass -File baseline/calc_metrics.ps1 -CompareA before_v1_dict -CompareB after_v1_dict`

Упрощенный интерактивный режим (рекомендуется):

```powershell
powershell -ExecutionPolicy Bypass -File baseline/evaluate_run.ps1 -RunName after_current_build -Scope high_medium
```

Опции:
- `-Scope all` — все кейсы.
- `-Scope high` — только high-priority.
- `-Scope high_medium` — high + medium (быстрый практичный прогон).
- `-FromCaseId 25` — продолжить с нужного `case_id`.

## Критерии
- Ticker/handles/URLs не должны ломаться.
- Крипто-сленг должен передавать смысл.
- Не должно быть артефактов (`§0`, дубли пунктуации, мусорные хвосты).
