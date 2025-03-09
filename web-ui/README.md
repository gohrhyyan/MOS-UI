# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

Project structure for the custom MOS UI hosted on NGINX
```
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
```

Core printer state object:
```
  const [printerState, setPrinterState] = useState({
    printStatus: 'idle',     // Current status: 'idle', 'printing', 'paused', etc.
    filename: null,          // Current file being printed
    progress: 0,             // Print progress (0-100)
    elapsedTime: 0,          // Time elapsed in seconds since print started
    estimatedTime: 0,        // Estimated total time in seconds
    isLoading: true,         // Loading state while initializing
    fileDetails: null,       // Detailed file metadata
  });
```


Important Websocket API information for state management:

"printer.objects.query" Return
```
{
  "id": 3,
  "jsonrpc": "2.0",
  "result": {
    "eventtime": 1232.509652496,
    "status": {
      "print_stats": {
        "filament_used": 18,
        "filename": "9of19TRex_H-Clips_0.15mm_PETG_MINI_58m.gcode",
        "info": {
          "current_layer": null,
          "total_layer": null
        },
        "message": "",
        "print_duration": 94.5110343140002, // elapsed time 
        "state": "printing",
        "total_duration": 121.12603553099984 // not relevant to calculating total time
      }
    }
  }
}
```

Then, pull additional job history details
```
"method": "server.files.metadata",
    "params": {
        "filename": "{filename}"
    }

    {
  "jsonrpc": "2.0",
  "result": {
    "estimated_time": 3465,
    "filament_name": "Hatchbox PETG @MINI+",
    "filament_total": 1589.34,
    "filament_type": "PETG",
    "filament_weight_total": 4.85,
    "file_processors": [],
    "filename": "9of19TRex_H-Clips_0.15mm_PETG_MINI_58m.gcode",
    "first_layer_bed_temp": 85,
    "first_layer_extr_temp": 230,
    "first_layer_height": 0.2,
    "gcode_end_byte": 2116802,
    "gcode_start_byte": 23992,
    "job_id": "000012",
    "layer_height": 0.15,
    "modified": 1740586442.7338789,
    "nozzle_diameter": 0.4,
    "object_height": 4.55,
    "print_start_time": 1741109389.2666376,
    "size": 2126776,
    "slicer": "PrusaSlicer",
    "slicer_version": "2.4.0+arm64",
    "thumbnails": [
      {},
      {},
      {}
    ],
    "uuid": "ff99f5bb-e482-4053-aa13-7362e8de9dbc"
  },
  "id": 4
}
```

Print Start Object:
```
{
  "jsonrpc": "2.0",
  "method": "notify_history_changed",
  "params": [
    {
      "action": "added",
      "job": {
        "auxiliary_data": [],
        "end_time": null,
        "exists": true,
        "filament_used": 0,
        "filename": "9of19TRex_H-Clips_0.15mm_PETG_MINI_58m(1).gcode",
        "job_id": "00000B",
        "metadata": {
          "estimated_time": 3465,
          "filament_name": "Hatchbox PETG @MINI+",
          "filament_total": 1589.34, // filament length in mm
          "filament_type": "PETG",
          "filament_weight_total": 4.85,
          "file_processors": [],
          "first_layer_bed_temp": 85,
          "first_layer_extr_temp": 230,
          "first_layer_height": 0.2,
          "gcode_end_byte": 2116802,
          "gcode_start_byte": 23992,
          "layer_height": 0.15,
          "modified": 1740586699.7955499,
          "nozzle_diameter": 0.4,
          "object_height": 4.55,
          "size": 2126776,
          "slicer": "PrusaSlicer",
          "slicer_version": "2.4.0+arm64",
          "thumbnails": [
            {},
            {},
            {}
          ],
          "uuid": "ab6c02ab-9178-41be-8cfe-50eb506f9934"
        },
        "print_duration": 0,
        "start_time": 1741006390.631167,
        "status": "in_progress",
        "total_duration": 0.0021053979999692274,
        "user": "_TRUSTED_USER_"
      }
    }
  ]
}
```

PAUSE object:
```
{
  "jsonrpc": "2.0",
  "method": "notify_gcode_response",
  "params": [
    "// PAUSE called with"
  ]
}
```

Resume object
```
{
  "jsonrpc": "2.0",
  "method": "notify_gcode_response",
  "params": [
    "// RESUME called with"
  ]
}
```

Job Finished Object
```
{
  "jsonrpc": "2.0",
  "method": "notify_history_changed",
  "params": [
    {
      "action": "finished",
      "job": {
        "auxiliary_data": [],
        "end_time": 1741109110.5816662,
        "exists": true,
        "filament_used": 0,
        "filename": "7of19TRex_Femur_Tibia_0.15mm_PETG_MINI_4h27m.gcode",
        "job_id": "000010",
        "metadata": {
          "size": 19896855,
          "modified": 1740586839.3691332,
          "uuid": "bb1340d1-e6f7-4f3a-ac9d-d0e0d74aff2d",
          "file_processors": [],
          "slicer": "PrusaSlicer"
        },
        "print_duration": 0,
        "start_time": 1741109106.322616,
        "status": "klippy_shutdown",
        "total_duration": 4.369036752000056,
        "user": "_TRUSTED_USER"
      }
    }
  ]
}
```
OR
```
{
  "jsonrpc": "2.0",
  "method": "notify_history_changed",
  "params": [
    {
      "action": "finished",
      "job": {
        "auxiliary_data": [],
        "end_time": 1741109339.635747,
        "exists": true,
        "filament_used": 0,
        "filename": "9of19TRex_H-Clips_0.15mm_PETG_MINI_58m.gcode",
        "job_id": "000011",
        "metadata": {
          "size": 2126776,
          "modified": 1740586442.7338789,
          "uuid": "ff99f5bb-e482-4053-aa13-7362e8de9dbc",
          "file_processors": [],
          "slicer": "PrusaSlicer"
        },
        "print_duration": 0,
        "start_time": 1741109325.8511364,
        "status": "cancelled",
        "total_duration": 13.632150834999948,
        "user": "_TRUSTED_USER_"
      }
    }
  ]
}
```
