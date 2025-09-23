import React, { useEffect, useState } from "react";
import { Paper, Typography, Box } from "@mui/material";

/**
 * ConfigData
 * ----------
 * Defines the expected structure of the configuration file (config.json).
 * This interface ensures type safety when consuming the JSON data.
 */
interface ConfigData {
  title: string;
  unit: string;
  lineColor: string;
  pointColor: string;
  backgroundColor: string;
}

/**
 * ConfigText Component
 * --------------------
 * Loads and displays configuration values from a JSON file.
 *
 * Behavior:
 * - On mount, fetches the config.json file asynchronously.
 * - While loading, displays a "Loading configuration..." message.
 * - If the fetch succeeds, renders a panel showing the config values
 *   (title, unit, colors, background).
 * - If the fetch fails, logs an error in the console.
 *
 * Key points:
 * - Uses React hooks (`useEffect` and `useState`) for lifecycle and state management.
 * - Applies Material-UI (`Paper`, `Typography`, `Box`) for consistent UI styling.
 * - Inline styles are used for dynamic color preview.
 */

// Component to fetch and display configuration values from config.json
const ConfigText: React.FC = () => {
    // Local state to store the configuration once it is loaded
  const [config, setConfig] = useState<ConfigData | null>(null);

  // Load configuration from the JSON file when the component is first mounted
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Fetch config.json from MSFS coherent GT path
        const response = await fetch(
          "coui://html_ui/InGamePanels/skyhigh-studios-assessment-toolbar/media/config.json"
        );
        const json = await response.json();
        setConfig(json); // Update state with the configuration data
      } catch (err) {
        // Log an error if the JSON cannot be read or parsed
        console.error("could not read config.json:", err);
      }
    };
    loadConfig();
  }, []); // Empty dependency array → runs only once when the component mounts

  // Show a loading state while the config is being fetched
  if (!config) {
    return (
      <Typography variant="body1" color="text.secondary">
        loading configuration...
      </Typography>
    );
  }

  // Render configuration details inside a styled Paper component
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        color: "text.primary",
        borderRadius: 2,
        mt: 2,
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Current Configurations
        </Typography>
        {/* Display each property from the JSON file */}
        <Typography variant="body1">
          <strong>Title:</strong> {config.title}
        </Typography>
        <Typography variant="body1">
          <strong>Unit:</strong> {config.unit}
        </Typography>
        <Typography variant="body1">
          <strong>Line Color:</strong>{" "}
          <span style={{ color: config.lineColor }}>{config.lineColor}</span>
        </Typography>
        <Typography variant="body1">
          <strong>Point Color:</strong>{" "}
          <span style={{ color: config.pointColor }}>{config.pointColor}</span>
        </Typography>
        <Typography variant="body1">
          <strong>Background:</strong>{" "}
          <span style={{ color: config.backgroundColor }}>
            {config.backgroundColor}
          </span>
        </Typography>
      </Box>
    </Paper>
  );
};

export default ConfigText;
