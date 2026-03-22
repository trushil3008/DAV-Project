# DAV-Project

A modular data analytics and visualization platform focused on YouTube video datasets across multiple countries. It combines a React frontend, a Node.js backend, and Python services for data processing and analysis.

## Quick Links

- Project root: DAV-Project/
- Frontend: client/
- Backend: server/
- Data & processing: services/ and data/

## Project Structure

```
DAV-Project/
├─ README.md
├─ client/                # React + Vite app (UI, dashboards)
│  ├─ package.json
│  └─ src/
├─ server/                # Node.js/Express API
│  ├─ package.json
│  └─ index.js
├─ services/              # Python ETL / analytics scripts
│  ├─ requirements.txt
│  ├─ main.py
│  └─ data_processor.py
├─ data/                  # Example or small datasets
│  └─ INvideos.csv
└─ services/datasets/     # Larger country datasets (CSV/JSON)
```

## Features

- Interactive dashboards and charts (React)
- Backend API for serving processed data
- Python-based data processing and clustering
- Multi-country datasets for comparative analytics

## Prerequisites

- Node.js (16+ recommended) and npm
- Python 3.8+ and pip
- On Windows: PowerShell or Command Prompt

## Setup (Windows)

1) Install frontend dependencies

```powershell
cd client
npm install
```

2) Install backend dependencies

```powershell
cd ..\server
npm install
```

3) Prepare Python environment and install requirements

```powershell
cd ..\services
python -m venv venv
venv\Scripts\Activate.ps1    # PowerShell (or use Activate.bat in CMD)
pip install -r requirements.txt
```

## Running the Project

Open two terminals (or use a process manager) and run:

Terminal A — Backend

```powershell
cd server
npm start
```

Terminal B — Frontend

```powershell
cd client
npm run dev
```

Optional: run Python services (data processing) in a third terminal after activating the virtualenv:

```powershell
cd services
venv\Scripts\Activate.ps1
python main.py
```

Note: Check `server/index.js` and `client/vite.config.js` for any custom ports or base URLs used by the project.


## About the Project

This project is a multi-component data analytics and visualization platform designed to analyze YouTube video datasets from various countries. It consists of:

- **Frontend (client):** A React-based web application for interactive dashboards, charts, and insights.
- **Backend (server):** A Node.js/Express server that provides APIs to serve data to the frontend.
- **Services (Python):** Python scripts and services for advanced data processing, clustering, and analytics, leveraging pandas and other libraries.
- **Data:** Includes CSV and JSON datasets for multiple countries, enabling cross-country analysis and comparison.

The platform allows users to explore trends, correlations, engagement metrics, and more, with a focus on YouTube video data. It is modular, making it easy to extend with new analytics or visualizations.