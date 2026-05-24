# UoS-Deadlines-Mech-Eng

A countdown timer for University of Southamopton deadlines, hosted on GitHub Pages.  

100% Claude Code.

## Usage

Edit [`deadlines.js`](deadlines.js) and push to `main`. The site deploys automatically.

```js
window.DEADLINES = {
  deadlines: [
    {
      name: "FEEG2003 Exam",
      label: "Optional subtitle",
      datetime: "2026-06-02T09:30:00",
      start: "2026-05-01T00:00:00"   // used for the progress bar
    }
  ]
};
```

- The most pressing upcoming deadline is shown as the main countdown.
- All other deadlines are listed below it.
- If the `deadlines` array is empty, GitHub Pages is automatically unpublished.

## Local development

Open `index.html` directly in a browser — no server needed.
