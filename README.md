# ic-designstudy-groupproj
web-ui - the custom MOS UI hosted on NGINX
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
    │   └── usePrintProgress.js     # Custom hook for print 
    progress
    └── utils/
        └── timeUtils.js           # Utility functions for time calculations