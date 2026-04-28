@echo off
title Claude Code (OpenRouter)
echo Connecting to OpenRouter...

:: 환경 변수 설정
set ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1
set ANTHROPIC_API_KEY=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

:: 클로드 실행
claude

:: 프로그램 종료 시 창이 바로 닫히지 않게 대기
pause
