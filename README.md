# keysmash

A playful, responsive typing speed test with 15, 30 and 60 second rounds, live WPM and accuracy, optional typing sounds, and a browser-local top-five scoreboard.

## Run

Serve this directory with any static web server. In the prepared cloud environment:

```sh
cd /workspace/Samad-ITPL
/workspace/.setup/bin/php -S 127.0.0.1:8000 -t .
```

Open the server root. No build, database, API keys or package installation is needed. Fonts load from Google Fonts with local fallback fonts.

The timer starts on the first character. WPM is correctly typed characters divided by five and elapsed minutes. Accuracy compares current input against the passage. Pasting and dropping text are disabled. Completing the passage also ends a round.

Scores are stored in localStorage on the same browser and origin; they are not a shared online leaderboard and can be edited by the browser owner. Names render as text. Browser storage restrictions show an actionable saving error.

To publish the website, deploy index.html, style.css and app.js to any static hosting service, including GitHub Pages. Publishing a Codex environment does not deploy the website publicly.
