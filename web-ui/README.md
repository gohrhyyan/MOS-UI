# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

 - the custom MOS UI hosted on NGINX
    src/
    ├── components/
    │   └── PrinterUI/
    │       ├── index.jsx           # Main PrinterUI component
    │       ├── views/   
    │       │   ├── HomeView.jsx        # Home view component
    │       │   ├── PrintView.jsx       # Print preview component
    │       │   └── StatusView.jsx      # Print status component
    │       └── common/             # Shared components
    │           ├── ResponsiveContainer.jsx
    │           ├── TopBar.jsx
    │           ├── Toast.jsx
    │           ├── QualitySpeedSlider.jsx
    │           └── StopDialog.jsx
    ├── hooks/
    │   ├── useMoonrakerSocket.js
    │   ├── useFileUpload.js
    │   └── usePrintProgress.js
    progress
    └── utils/
        └── timeUtils.js

