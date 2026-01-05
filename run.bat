@echo off
echo Movie Systems Design Application
echo ================================
echo.

if "%OPENAI_API_KEY%"=="" (
    echo Note: OPENAI_API_KEY not set. Using mock enrichment mode.
    echo To use LLM features, set it with: set OPENAI_API_KEY=your_key
    echo.
)

echo Starting application...
echo.
python main.py
pause

