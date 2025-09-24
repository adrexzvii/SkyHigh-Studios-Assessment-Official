import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Stack
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
/**
 * Props for the AudioControl component
 */
interface AudioControlProps {
  /** Label displayed above the control */
  label: string;
  /** Indicates if the audio is currently playing */
  isPlaying: boolean;
  /** Callback to toggle play/stop state */
  onToggle: () => void;
  /** Current volume value (0–100) */
  value: number;
  /** Callback triggered when volume changes */
  onVolumeChange?: (value: number) => void;
  /** If true, disables the play button */
  disabledPlay?: boolean;
}
/**
 * AudioControl
 * A reusable component that provides a play/stop button and a volume slider.
 * - The button toggles audio playback.
 * - The slider updates the volume and calls the provided callback.
 */
const AudioControl: React.FC<AudioControlProps> = ({
  label,
  isPlaying,
  onToggle,
  value,
  onVolumeChange,
  disabledPlay,
}) => {
  /**
   * Handles volume slider changes.
   * @param _ - event (unused)
   * @param newValue - new slider value
   */
  const handleVolume = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === "number" && onVolumeChange) {
      onVolumeChange(newValue);
    }
  };

  return (
    <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "text.primary", alignSelf: "flex-start" }}
      >
        {label}
      </Typography>
      <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
        <IconButton
          disabled={disabledPlay}
          onClick={onToggle}
          sx={{
            bgcolor: isPlaying ? "error.main" : "primary.main",
            color: "background.default",
            mr: 3,
            transition: "background-color 0.2s ease-in-out",
            ":hover": {
              bgcolor: isPlaying ? "error.light" : "primary.light",
            },
          }}
        >
          {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Slider
          value={value}
          step={10}
          min={0}
          max={100}
          onChange={handleVolume}
          sx={{ color: "primary.main", flex: 1 }}
        />
      </Box>
    </Stack>
  );
};
/**
 * ControlPanel
 * Main container that manages multiple AudioControl components.
 * - Handles state for playback and volume.
 * - Communicates with MSFS (via SimVar) to set custom L:Vars.
 */
const ControlPanel: React.FC = () => {
  // Playback states
  const [carPlaying, setCarPlaying] = useState(false);
  const [cricketPlaying, setCricketPlaying] = useState(false);
  const [landingPlaying, setLandingPlaying] = useState(false);

  // Volume states
  const [carVolume, setCarVolume] = useState(100);
  const [cricketVolume, setCricketVolume] = useState(100);
  const [landingVolume, setLandingVolume] = useState(100);

  /**
   * Effect: when component mounts, set initial SimVar volumes after 2 seconds.
   * This ensures MSFS is ready before applying values.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        SimVar.SetSimVarValue("L:C53_CAR_VOLUME", "number", 100);
        // @ts-ignore
        SimVar.SetSimVarValue("L:C53_ANIMALS_VOLUME", "number", 100);
        // @ts-ignore
        SimVar.SetSimVarValue("L:C53_LANDING_VOLUME", "number", 100);
        console.log("Volúmenes iniciales enviados a 100");
      } catch (err) {
        console.error("Error asignando volúmenes iniciales:", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
      {/* SimObject: Only volume slider, no play button */}
      <AudioControl
        label="SimObject Volume"
        isPlaying={false}
        onToggle={() => {}}
        disabledPlay
        value={100}
        onVolumeChange={(value) => {
          try {
            // @ts-ignore
            SimVar.SetSimVarValue("L:C53_SOUND_VOLUME", "number", value);
          } catch (err) {
            console.error("Error SimObject volume:", err);
          }
        }}
      />

      {/* Car sample */}
      <AudioControl
        label="Car sample"
        isPlaying={carPlaying}
        onToggle={() => {
          try {
            // @ts-ignore
            SimVar.SetSimVarValue("L:c53_oldcar", "number", carPlaying ? 0 : 1);
          } catch (err) {
            console.error("Error Car toggle:", err);
          }
          setCarPlaying(!carPlaying);
        }}
        value={carVolume}
        onVolumeChange={(value) => {
          setCarVolume(value);
          try {
            // @ts-ignore
            SimVar.SetSimVarValue("L:C53_CAR_VOLUME", "number", value);
          } catch (err) {
            console.error("Error Car volume:", err);
          }
        }}
      />

      {/* Cricket sample */}
      <AudioControl
        label="Cricket sample"
        isPlaying={cricketPlaying}
        onToggle={() => {
          try {
            // @ts-ignore
            SimVar.SetSimVarValue(
              "L:c53_animals",
              "number",
              cricketPlaying ? 0 : 1
            );
          } catch (err) {
            console.error("Error Cricket toggle:", err);
          }
          setCricketPlaying(!cricketPlaying);
        }}
        value={cricketVolume}
        onVolumeChange={(value) => {
          setCricketVolume(value);
          try {
            // @ts-ignore
            SimVar.SetSimVarValue("L:C53_ANIMALS_VOLUME", "number", value);
          } catch (err) {
            console.error("Error Cricket volume:", err);
          }
        }}
      />

      {/* Landing sample */}
      <AudioControl
        label="Landing sample"
        isPlaying={landingPlaying}
        onToggle={() => {
          try {
            // @ts-ignore
            SimVar.SetSimVarValue(
              "L:c53_landingg",
              "number",
              landingPlaying ? 0 : 1
            );
          } catch (err) {
            console.error("Error Landing toggle:", err);
          }
          setLandingPlaying(!landingPlaying);
        }}
        value={landingVolume}
        onVolumeChange={(value) => {
          setLandingVolume(value);
          try {
            // @ts-ignore
            SimVar.SetSimVarValue("L:C53_LANDING_VOLUME", "number", value);
          } catch (err) {
            console.error("Error Landing volume:", err);
          }
        }}
      />
    </Box>
  );
};

export default ControlPanel;
