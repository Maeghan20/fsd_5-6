# PatternWatch — React Domain-Based Application

**Domain:** Digital governance and consumer protection  
**Module:** Consumer reporting, evidence review and accountability tracking

PatternWatch is a React prototype that helps document potentially manipulative digital experiences. Consumers can submit reports, researchers can review and classify them, the public can browse reviewed findings, and organisational responses can be recorded.

> This is an educational prototype with sample data. A report is not proof of wrongdoing, and a published finding in this demo is not a legal determination or regulatory certification.

## Features

- Dashboard with report, review, finding and response counts.
- Consumer report submission form with multiple inputs, radio-like category selection through a dropdown, radio buttons for impact, and an evidence link.
- Searchable transparency library with category and status filters.
- Investigation desk to review, edit, delete and classify reports.
- Accountability tracker to record, update and remove organisational responses.
- Responsive layout for desktop and mobile.

## Requirements

- Node.js (LTS recommended)
- npm (installed with Node.js)
- Internet connection for the first dependency installation

## Run the project

1. Extract the ZIP file.
2. Open the extracted `patternwatch-react-lab` folder in VS Code.
3. Open the VS Code terminal: **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   ```

5. Start both the React development server and JSON Server:

   ```bash
   npm start
   ```

6. Open the local URL printed by Vite, usually:

   `http://localhost:5173`

Keep the terminal running while using the application. Press `Ctrl + C` to stop both servers.

### Alternative: start the servers separately

Open two terminals in the project folder.

Terminal 1:

```bash
npm run server
```

Terminal 2:

```bash
npm run dev
```

## How to demonstrate CRUD

### Create
Open **Submit a report**, complete the form and submit. The report is saved to `db.json` through JSON Server.

### Read
Open **Transparency library** to view reports. Use search and filters.

### Update
Open **Investigation desk**, select the three-dot edit action to modify report details, or open a report for review and update its status/severity/reviewer note.

### Delete
Open **Investigation desk** and use the trash icon. Confirm the deletion.

### Accountability
Open **Accountability**, select a report and record an organisation response. Change its status or remove it.

## Technology used

- React 18
- Vite
- JavaScript (ES6+)
- CSS
- React Hooks (`useState`, `useEffect`, `useMemo`)
- JSON Server (REST API simulation)
- Lucide React icons

## API endpoints

JSON Server runs at `http://localhost:3001`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reports` | Read reports |
| POST | `/reports` | Create report |
| PATCH | `/reports/:id` | Update report |
| DELETE | `/reports/:id` | Delete report |
| GET / POST | `/platforms` | Read or create platforms |
| GET / POST | `/findings` | Read or create findings |
| GET / POST / PATCH / DELETE | `/responses` | Manage company responses |

## Project structure

```text
patternwatch-react-lab/
├── db.json
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Notes and limitations

- Data is stored locally in `db.json`; this is a development database, not a production database.
- Evidence is represented by a URL field. The prototype does not upload files to cloud storage.
- The review workflow is simulated and does not provide real user authentication or role-based access control.
- Sample platforms and reports are fictional.
- The application does not automatically detect dark patterns or determine legal violations.
- The charts and metrics describe only the local sample database.
- A production service would need authentication, privacy controls, secure evidence storage, moderation policies, audit logs and a process for corrections/appeals.

## AI-use declaration (edit to reflect your actual use)

AI assistance was used to help plan the application structure, generate and refine portions of the React implementation, and support debugging. The project was reviewed, run and tested by the student. The student is responsible for understanding the components, state handling, event handling, API calls and CRUD workflow before submission.
