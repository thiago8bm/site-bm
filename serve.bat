@echo off
echo ====================================
echo  Baile de Munique - Servidor Local
echo ====================================
echo.
echo Iniciando servidor em http://localhost:5500
echo Pressione Ctrl+C para encerrar.
echo.
start "" "http://localhost:5500"
python -m http.server 5500
