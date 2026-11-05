$Host.UI.RawUI.WindowTitle = 'MedGuide Report - Actual PostgreSQL Vector Retrieval'
Set-Location 'C:\Hemanth\Projects\MedGuide_AI'
Write-Host 'PS> backend/.venv/Scripts/python.exe Minor_Project_Outputs/README_and_Checklist/capture_pgvector.py' -ForegroundColor Yellow
& 'backend/.venv/Scripts/python.exe' 'Minor_Project_Outputs/README_and_Checklist/capture_pgvector.py'
