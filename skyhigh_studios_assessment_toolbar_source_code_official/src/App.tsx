import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import SpeedChart from "./components/SpeedChart";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import darkTheme from "./theme";
import ConfigText from "./components/ConfigText";

/**
 * App Component
 * -------------
 * Root component of the MSFS Control Dashboard application.
 *
 * Features:
 * - Provides global Material UI theme (dark mode).
 * - Renders a top navigation bar with a centered title.
 * - Includes tabbed navigation to switch between:
 *   1. Control Panel
 *   2. Speed Chart
 *   3. JSON Data (ConfigText)
 *
 * State:
 * - tabIndex {number}: Keeps track of the currently selected tab.
 */
function App() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top bar with centered title and navigation tabs */}
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              MSFS Control Dashboard
            </Typography>
          </Toolbar>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="fullWidth"
          >
            <Tab label="Control Panel" />
            <Tab label="Speed Chart" />
            <Tab label="JSON Data" />
          </Tabs>
        </AppBar>

         {/* Tab content (mounted always, hidden via CSS for persistence) */}
        <Box sx={{ flex: 1, p: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ display: tabIndex === 0 ? "block" : "none" }}>
            <ControlPanel />
          </Box>
          <Box sx={{ display: tabIndex === 1 ? "block" : "none" }}>
            <SpeedChart />
          </Box>
          <Box sx={{ display: tabIndex === 2 ? "block" : "none" }}>
            <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
              <Typography variant="h6" gutterBottom>
                JSON Data
              </Typography>
              <ConfigText />
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
