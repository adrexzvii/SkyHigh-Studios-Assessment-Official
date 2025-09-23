import React from "react";
import { Box, Slider, Typography, IconButton, Stack } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

/**
 * AudioControlProps
 * -----------------
 * Props for the AudioControl component.
 *
 * @property {string} label - The label shown above the slider and play button.
 * @property {boolean} [disabledPlay] - Optional flag to disable the play button.
 */

interface AudioControlProps {
  label: string;
  disabledPlay?: boolean; 
}

/**
 * AudioControl Component
 * ----------------------
 * Reusable UI component that provides:
 * - A label for the audio source.
 * - A play button (disabled optionally).
 * - A slider to adjust volume or another numeric value.
 *
 * Behavior:
 * - Logs slider value changes with the associated label.
 * - Styles the play button differently if disabled.
 */
const AudioControl: React.FC<AudioControlProps> = ({ label, disabledPlay }) => {

  /**
   * Handle slider changes
   * Logs the current slider value along with its label.
   */
  const handleChange = (_: Event, value: number | number[]) => {
    if (typeof value === "number") {
      console.log(`${label}: ${value}`);
    }
  };

  return (
    <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
      {/* Label */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "text.primary", alignSelf: "flex-start" }}
      >
        {label}
      </Typography>

      {/* Play button + Slider */}
      <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
        <IconButton
          disabled={disabledPlay} // disable button if prop is true
          sx={{
            bgcolor: disabledPlay ? "grey.700" : "primary.main", // different style if disabled
            color: "background.default",
            mr: 3,
            ":hover": disabledPlay ? {} : { bgcolor: "primary.light" },
          }}
        >
          <PlayArrowIcon />
        </IconButton>
        <Slider
          defaultValue={0}
          step={10}
          min={0}
          max={100}
          onChange={handleChange}
          sx={{
            color: "primary.main",
            flex: 1,
            "& .MuiSlider-thumb": { width: 14, height: 14 },
          }}
        />
      </Box>
    </Stack>
  );
};

/**
 * ControlPanel Component
 * ----------------------
 * Main panel that aggregates multiple AudioControl components.
 *
 * Features:
 * - Displays several audio controls for different sources.
 * - First control ("SimObject Volume") has its play button disabled
 *   to represent a restricted or non-interactive audio sample play/stop source.
 *
 * Layout:
 * - Styled container with padding, rounded corners, and vertical spacing.
 */
const ControlPanel: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 3,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: 500,
        mx: "auto",
      }}
    >
      <AudioControl label="SimObject Volume" disabledPlay /> {/* Disabled */}
      <AudioControl label="Car sample" />
      <AudioControl label="Cricket Sample" />
      <AudioControl label="Landing Sample" />
    </Box>
  );
};

export default ControlPanel;
