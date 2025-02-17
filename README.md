![image](https://github.com/user-attachments/assets/b172adfb-9a0b-4fe7-a8f0-8c4e5a934b20)
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
    │   ├── useFileUpload.js
    │   └── usePrintProgress.js
    progress
    └── utils/
        └── timeUtils.js
