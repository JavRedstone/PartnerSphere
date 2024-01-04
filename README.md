# PartnerSphere Project [&copy; Javier Huang 2024]

# Hosted URL using Cloudflare Pages: https://partner-sphere.pages.dev/

## General Structure

### Frontend: Svelte web application

- Svelte version 4.2.8
- Recommended IDE: Visual Studio Code

### Backend & Database: Firebase Cloud Firestore

## Credit

### References

- Material Design: https://material.angular.io/
- Material Icons: https://fonts.google.com/icons
- Firebase: https://firebase.google.com/
- PDFMake Tutorial Code: https://github.com/pandeysoni/pdfmake/blob/master/src/App.js [https://pandeysoni.medium.com/how-to-generate-pdf-file-using-pdfmake-module-660509799461]

### Libraries Used

*For all libraries used for the frontend code, please check the `package.json` file under the `source_code/frontend/` folder.*
*For all plugins used for the backend code, please check the `pom.xml` file under the `source_code/backend/ramsevents/` folder.*

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.