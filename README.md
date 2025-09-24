# Technical Assessment – MSFS Development

> **Project**: SkyHigh Studios – Prototype SimObject + Panel (MSFS)

## Context
This prototype demonstrates technical skills, design criteria, and problem-solving approach within the Microsoft Flight Simulator (MSFS 2020/2024) ecosystem. The goal is **not** to publish a final product, but to show justified technical decisions and how they are validated.

---

## Feature Map (Requirements → Implementation)

1) **SimObject that moves in a triangle (smooth loop)**  
- **Approach**: path of 4 waypoints (so it returns to its initial position) in a triangle with smooth movements and a loop.  
- **Control**: using worldscripts with a groundservices simobject from the MSFS SDK.

2) **Audio in the SimObject (2+ sounds)**  
- **Approach**: audio integration through `Wwise` referenced in `sound.xml`.  
- **Events**: *Volume governed by LVar/RTPC and play action with custom Lvars SimVars.*

3) **Daytime visibility**  
- **Rule**: the model is only visible during the day, hidden at night.  
- **Approach**: condition by SimVar (`TIME OF DAY`) and `VisibilityConditions` in model behavior, if it is 1=day, simobject appears, different from 1, it disappears.

4) **Panel with volume slider**  
- **Stack**: Panel HTML/JS, React/TS and Material UI inside `html_ui`.  
- **Control**: the slider writes to `L:SIMOBJECT_VOLUME` and other Lvars and the sound.xml reads it as RTPC/, play/pause button through custom Lvars.

5) **Sound by flight event**  
- **Decision**: *Landing detected by change in `SIM ON GROUND`*.  
- **Justification**: robust, low cost and consistent; documented below.  
- **Control**: logic in WASM/SimConnect to use custom Lvars and complex logic to interact with the **Landing** variable of an aircraft and activate the sound in the simobject on the ground.

6) **Panel loads JSON and displays it**  
- **Feature**: basic JSON viewer that retrieves the value from `config.json`* and displays it.

7) **Visualization with real data (not simulated)**  
- **Chart**: descent profile (*Altitude vs. Time*) & (*Velocity vs. Time*) divided into tabs, with start/stop button and dynamic chart, being able to zoom in/out and move the chart by holding the left click.  
- **Source**: real data obtained from the simulator via SimVars in real time.  
- **Lib**: normalized svg since coherent GT is based on an old Chromium browser and does not support chart libraries.

---

## Repository structure

```
/ (root)
├─ WASM_Module1/                     # Native code (SimConnect/WASM) – movement/event logic
├─ adriantest-lowerloon/             # MSFS Project (Project/Package) – package definitions
├─ loonCart/                         # Assets/models/config (depending on content)
├─ skyhigh_studios_assessment_toolbar_source_code_official/   # Panel (HTML/JS/TS/React)
├─ data/                             # Real flight data (.json) for visualization
└─ README.md                         # This document
```

## Prerequisites
- MSFS 2020 **or** 2024 installed (stable version).  
- **SDK** installed and *Developer Mode* enabled inside the simulator.  
- Node.js LTS (for the panel) if compiling the panel from source.  
- Visual Studio Code  
- (Optional) Wwise if advanced audio is required; if not, `.wav` works.

---

## Installation and testing
### Explanation of folders and files

- **WASM_Module1/**: Contains the native C++ module that handles SimObject movement, connection with SimConnect, and event detection such as landing.

- **adriantest-lowerloon/**: MSFS Project with package definitions (`.xml`, `layout.json`, `manifest.json`). The final package is built here to load into *Community*.

- **loonCart/**: Folder for assets (3D models, textures, sound/animation configs).

- **skyhigh_studios_assessment_toolbar_source_code_official/**: Source code of the panel in React/TypeScript. Includes:
  - **src/components/**:  
    - `ConfigText.tsx`: Component to display configuration loaded from JSON.  
    - `ControlPanel.tsx`: Main panel with volume slider and controls.  
    - `ControlPanel.css`: Panel styles.  
    - `SpeedChart.tsx`: Altitude/Speed vs Time chart.  
  - **media/**: Configuration files and sample data (`config.json`).  
  - `App.tsx`, `index.tsx`: React entry point.  
  - `theme.tsx`: Theme/style definitions.  
  - `logo.svg`, `App.css`, `index.css`: Visual resources.  
  - `package.json`, `tsconfig.json`, `config-overrides.js`: Dependencies, TypeScript and overrides configuration.  
  - `Dist` folder containing css, js and config.json files for functionality

### A) Quick install (just to test the package)
1. **Package** **loonCart** from DevMode (Project Editor → *Build All*).  
2. **Copy the generated package** in **Packages** to your **Community Folder** (MSFS2020) or add via *Library* (MSFS2024).  
3. Start a day flight, locate at Jorge Wilsterman airport in Cochabamba, Bolivia ICAO: SLCB:  
4. <img width="1919" height="1079" alt="Screenshot 2025-09-23 213904" src="https://github.com/user-attachments/assets/f251f3c2-ce19-453c-890b-ded7443d716f" />

   - The object appears (**only during the day**).  
   - Moves smoothly in a triangle.  
   - On landing (chosen event), the *landing* sound is played in loop.  
   - The panel adjusts the volume of the landing sound and the samples along with a play/pause button available only for samples, and the state is saved when switching between tabs.  
   - The panel graphs in real time whether it is on the tab or not.  
   - The panel displays a short message from config.json  
   - config.json:  
     ```json
     {
       "title": "Json loaded from config.json",
       "unit": "Thank you Sky Hight Studios for this opportunity!",
       "lineColor": "#00ffcc",
       "pointColor": "#ffcc00",
       "backgroundColor": "#0b1d3a"
     }
     ```

### B) Build from the toolbar source code (**skyhigh_studios_assessment_toolbar_source_code_official**) and msfs package (**loonCart**) (recommended for development and project modification)
  **Panel**:
1. Open with Visual Studio Code **skyhigh_studios_assessment_toolbar_source_code_official** folder
   
   ```bash
   cd skyhigh_studios_assessment_toolbar_source_code_official
   npm install
   # If the project uses react-app-rewired, install it:
   #   npm i -D react-app-rewired
   once the file modification is finished, npm run build
   ```
2. Copy/integrate the output of `dist/css` `dist/js` `dist/media` into the folder `SkyHigh-Studios-Assessment-Official\loonCart\static\html_ui\InGamePanels\lower-loon-toolbar\` of the project package.  
3. **Open the simulator** → Enable *Developer Mode*.  
4. **Project Editor** → *Open project…* and select `loonCart/loonCart.xml`.  
5. **Build All** to generate the package.

> If your environment is MSFS2024/2020, check your *Community* path depending on platform (MS Store/Steam).

## Panel usage
<img width="697" height="703" alt="image" src="https://github.com/user-attachments/assets/b9d46af1-eb00-4827-83ff-9d0d9b272001" />
<img width="690" height="698" alt="image" src="https://github.com/user-attachments/assets/6db1d94f-2ede-4681-82d9-e5ef05e6cb26" />
<img width="694" height="701" alt="image" src="https://github.com/user-attachments/assets/a86a4140-0895-4993-a10f-5195624245f3" />
<img width="781" height="522" alt="image" src="https://github.com/user-attachments/assets/41685c29-8bf0-4e3a-b832-3279be9f750d" />

-# Panel usage (3 tabs)

The panel opens from the **toolbar** of the simulator. It is composed of **three tabs**:  
1) **Control Panel** · 2) **JSON data** · 3) **Speed chart**

---

## 1) Tab **Control Panel**
**Objective:** manage the **SimObject’s audio volume** in real time.

**Key elements**
- **Volume sliders (0–100):** move the control to adjust the SimObject’s audio level.  
  - Writes to the local variable or equivalent variable configured in your project.  
  - Affects both the **base loop** audio and the samples (for example, the *landing* sound), does not affect the “car” sound of the groundvehicle due to the model behavior and template used to disable that sound depending on day/night.

**Usage flow**
1. Open the **Control** tab.  
2. Adjust the **slider**; the change is immediate in the SimObject.  
3. Validate in the world: the sound should increase/decrease proportionally.

> **Notes**
> - If you don’t hear changes, confirm that the XML/Wwise/`.wav` links the **RTPC/Gain** to the value of `L:SIMOBJECT_VOLUME`.  
> - If the SimObject is not **visible** (at night) or **out of range**, you may not hear audio because it has a 50m attenuation.

---

## 2) Tab **JSON data**
**Objective:** load/visualize JSON files and display their information in the interface.

**What it contains**
- **“Config” section (read-only):** shows the contents of `media/config.json` (or the active config file) in readable format.  
  - Useful for verifying panel parameters (for example, data routing, labels, thresholds, etc.).
- **Automatic JSON file loader**
- **Data summary:** a **table** (or formatted text block) with:  
  - config.json:  
     ```json
     {
       "title": "Json loaded from config.json",
       "unit": "Thank you Sky Hight Studios for this opportunity!",
       "lineColor": "#00ffcc",
       "pointColor": "#ffcc00",
       "backgroundColor": "#0b1d3a"
     }
     ```

## 3) Tab **Speed chart**
**Objective:** plot an **altitude vs time** profile and a **speed vs time** profile using **real data**.  

## Design decisions (and alternatives)

### Triangular movement
- **Decision**: use of worldscripts with 4 waypoints (to return to the initial position) (A→B→C→A).  
- **Reasoning**: simplicity and control over speed and turns.  

### Audio: Wwise vs .wav
- **Decision**: dual support. Wwise for advanced control (RTPC, effects); `.wav` to import `.wav` files into WWISE.  
- **Trade-off**: Wwise requires licenses but is very useful.

### Flight event (Landing)
- **Decision**: use transitions of `SIM ON GROUND`→`true` to trigger *Landing sound* using WASM for complex functions to obtain simulator data, linking GroundVehicle SimObject and aircraft for landing and day/night logic.  
- **Risks**: false positives on irregular terrain or *hard bounces* and the sound gets stuck in loop.  
- **Alternatives**: `GEAR HANDLE POSITION`, `VERTICAL SPEED` crossing threshold, or derived *touchdown rate*.

### Day/night visibility
- **Decision**: hide model at *night* through condition in XML/SimVar in **ASO_Boarding_Stairs.xml**.  

### Panel & Data
- **Decision**: minimal and responsive UI with Material UI and React TS, using svg models for charts.  

---

## Known limitations
- **MSFS2024**: recent changes in Library paths may require confirming the Community/ folder from the simulator.  
- Developed for MSFS2020, not tested in MSFS2024.  
- The ground Vehicle has no animations.  
- Toolbar states are not saved if closed (they return to original state).  
- When pressing stop in the speed chart tab the chart is cleared and starts over.  
- The play button of simobject value is disabled because it activates with the simobject, placed only for aesthetics.  
- Visualization limited to the config.json structure, if another file with a different structure is used, it will not recognize it.

---

## Roadmap & Extras (valued)
- Panel UI/UX: detailed tooltips, light/dark themes, accessibility (keyboard/contrast).  
- Extra visualizations: *IAS vs Time*, *VS vs Time*, *Altitude vs Distance* with configurable smoothing.  
- SimObject animations: smooth *banking* in turns, slight *idle* oscillations.  
- Audio optimization: *ducking* when ATC speaks; physical *distance attenuation*.  
- Persistence: remember last loaded JSON; export charts to PNG/CSV.

---

## Time estimate (example)
- Design & project setup: **3–4 h**  
- SimObject movement + visibility: **4–6 h**  
- Audio + flight event: **6–8 h**  
- Panel (UI, slider, JSON, chart): **10–12 h**  
- Testing & packaging: **2–3 h**  
**Total estimate**: 25–33h (depending on iterations and SDK/sim bugs).

---

## How to validate (checklist)
- [x] SimObject appears **only during the day** and hides at night.  
- [x] Moves **continuously** A→B→C→A with smooth transitions.  
- [x] **2+ sounds** are heard (loop + event).  
- [x] Create the toolbar panel.  
- [x] **Slider** controls perceptible volume.  
- [x] Load JSON shows **information**.  
- [x] **Landing** sound triggers on touchdown.  
- [x] Create charts with real simulator data.  
- [x] Use of wasm for complex functionalities.  

---

## Troubleshooting
- **Does not appear in the world**: confirm *Build All* without errors and that the package is active in *Community/Library*.  
- **Panel does not load**: inspect coherent gt debugger console found in the sdk.  
- **Slider does not affect audio**: check the LVar and RTPC/gain binding.  
- **Landing event does not sound**: check `SIM ON GROUND` and wasm.  

---

## License and credits
- For technical assessment purposes only. Enable audio/third-party credits/licenses as appropriate.

---

## References
- MSFS SDK forum  
- Community resources

---

## Author
**Adrián Zegarra** – SkyHigh Studios Assessment
