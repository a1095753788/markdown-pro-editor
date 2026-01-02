#!/bin/bash
echo "Starting Markdown Pro Editor..."
echo "Opening browser..."
open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null
python3 -m http.server 8000
