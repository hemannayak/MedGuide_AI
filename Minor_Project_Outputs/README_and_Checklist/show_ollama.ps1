$Host.UI.RawUI.WindowTitle = 'MedGuide Report - Actual Ollama CLI Execution'
Set-Location 'C:\Hemanth\Projects\MedGuide_AI'
Write-Host 'MedGuide AI | Local model execution | 23 October 2026' -ForegroundColor Cyan
Write-Host 'This is a model capability demonstration, not clinical guidance.'
Write-Host ''
Write-Host 'PS> ollama run llama3.2:3b "State your clinical role in one sentence."' -ForegroundColor Yellow
& 'C:\Users\Pangoth\AppData\Local\Programs\Ollama\ollama.exe' run llama3.2:3b 'State your clinical role in one sentence.' | Tee-Object -FilePath 'Minor_Project_Outputs/README_and_Checklist/ollama_response.txt'
Write-Host ''
Write-Host "Ollama exit status: $LASTEXITCODE"
Write-Host 'Separate CLI proof. The application remains configured for Groq.' -ForegroundColor Cyan
