
# 3. Check for specific legacy files
echo "Checking for legacy files..."
if (Test-Path "main_gui.py") { echo "main_gui.py restored." } else { echo "main_gui.py MISSING." }
if (Test-Path "src_local/interface/views/dashboard_view.py") { echo "dashboard_view.py restored." } else { echo "dashboard_view.py MISSING." }
if (Test-Path "src_local/utils/cognitive_engine.py") { echo "cognitive_engine.py restored." } else { echo "cognitive_engine.py MISSING." }

# 4. Git Status Check
echo "Git Status Summary:"
git status --short | Select-Object -First 10
