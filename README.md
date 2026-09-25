# KYU Lingua

KYU Lingua is an English text converter for **Luganda** and **French**. Common phrases are stored locally and work without internet. Other sentences are translated through the Fasiri online translation service.

## What you need

- A computer with Windows, macOS, or Linux
- [Node.js](https://nodejs.org/) version 20 or newer
- An internet connection for sentences that are not in the offline dictionary
- A free Fasiri API key

No `npm install` command is needed because this project does not use external Node.js packages.

## 1. Copy the project to the other computer

Copy the entire project folder using a flash drive, email, cloud storage, or Git. The folder should contain at least:

```text
Gin/
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── .env.example
└── kyulogo.jpeg
```

Do not send your personal `.env` file or API key to another person. Each person should create their own free key.

## 2. Install Node.js

Download and install the current LTS version from [nodejs.org](https://nodejs.org/).

After installation, open a terminal and confirm that Node.js is available:

```powershell
node --version
```

The command should display version 20 or newer. If the command is not recognized, restart the terminal or computer after installing Node.js.

## 3. Get a free Fasiri key

1. Open [fasiri-ai.com](https://www.fasiri-ai.com/).
2. Select **Generate Free Key**.
3. Copy the key. It normally begins with `fsri_`.

Fasiri does not require a payment card to generate the free key.

## 4. Create the environment file

Inside the project folder, make a copy of `.env.example` and rename the copy to `.env`.

On Windows PowerShell, you can run:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the example key with the real Fasiri key:

```env
FASIRI_API_KEY=fsri_your_actual_key
FASIRI_API_ENDPOINT=https://api.fasiri-ai.com/api/v1/translate
```

Save the file. Do not add quotation marks around the key.

## 5. Start the project

Open a terminal in the project folder and run:

```powershell
npm start
```

When the terminal displays the following message, the project is ready:

```text
KYU Lingua is running at http://localhost:3000
```

Open a browser and visit:

```text
http://localhost:3000
```

Keep the terminal open while using the translator. Press `Ctrl + C` in the terminal when you want to stop the server.

## How to translate text

1. Enter English text in the left panel.
2. Select **Luganda** or **French**.
3. Select **Translate text**.
4. Use the copy button to copy the translated result.

Common phrases translate immediately from the offline dictionary. New sentences may take longer because they are sent to the online service. Previously translated sentences are cached and should appear faster when repeated.

## Important

Do not open `index.html` directly by double-clicking it when you want online translation. Always run `npm start` and use `http://localhost:3000`.

The `.env` file is excluded by `.gitignore` so the private API key is not accidentally uploaded to Git.

## Troubleshooting

### `npm` or `node` is not recognized

Install Node.js, then close and reopen the terminal.

### The page says online translation is not configured

Check that:

- The file is named exactly `.env`, not `.env.txt`.
- `FASIRI_API_KEY` contains the real key.
- The server was restarted after editing `.env`.

### The browser cannot open localhost

Make sure `npm start` is still running. If port 3000 is already being used, start the server on another port in PowerShell:

```powershell
$env:PORT=3001
npm start
```

Then open `http://localhost:3001`.

### Translation takes a long time or fails

Confirm that the computer is connected to the internet. The Fasiri service may occasionally be busy or unavailable; offline dictionary phrases will still work.

### Changes do not appear in the browser

Restart the server and refresh the browser with `Ctrl + F5`.

## Project files

- `index.html` — page structure
- `style.css` — colors, layout, and responsive design
- `script.js` — user interactions, offline phrases, and API requests
- `server.js` — local web server and secure connection to Fasiri
- `.env` — private API configuration; do not share it
- `kyulogo.jpeg` — Kyambogo University logo

