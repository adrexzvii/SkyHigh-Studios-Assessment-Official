import React, { useEffect, useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import TimelineIcon from "@mui/icons-material/Timeline";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import SpeedIcon from "@mui/icons-material/Speed";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

/**
 * SamplePoint
 * -----------
 * Defines a single measurement sample taken from the simulator.
 *
 * Properties:
 * - t: Timestamp in seconds since recording started
 * - alt_ft: Altitude in feet
 * - kias: Indicated airspeed in knots
 */
interface SamplePoint {
  t: number;
  alt_ft: number;
  kias: number;
}

/**
 * SpeedChart Component
 * --------------------
 * Real-time chart that displays MSFS (Microsoft Flight Simulator) data
 * such as altitude and indicated airspeed.
 *
 * Behavior:
 * - Fetches simulator variables (`SimVar`) every second when recording is active.
 * - Maintains an internal list of samples with time, altitude, and speed.
 * - Provides UI controls to:
 *   - Start/stop data recording
 *   - Switch between altitude/speed view
 *   - Zoom in/out on the timeline
 *   - Drag horizontally (pan) to explore past data
 * - Dynamically scales axes to fit the collected data.
 *
 * Visualization:
 * - Renders a responsive SVG chart with axes, grid lines, a polyline, and data points.
 * - Colors: green for altitude, orange for speed.
 *
 * Key implementation details:
 * - Uses `useRef` and `setInterval` for periodic polling of SimVars.
 * - Scales (`scaleX`, `scaleY`) are computed dynamically using zoom and offset.
 * - Prevents unbounded memory usage by keeping all collected samples in state.
 */

const SpeedChart: React.FC = () => {
    // State for chart mode, recording status, and samples
  const [mode, setMode] = useState<"altitude" | "speed">("altitude");
  const [isRecording, setIsRecording] = useState(false);
  const [startEpoch, setStartEpoch] = useState<number | null>(null);
  const [samples, setSamples] = useState<SamplePoint[]>([]);

  // State for zoom/pan interaction
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState<number | null>(null);

  const tickRef = useRef<NodeJS.Timeout | null>(null);

   /**
   * Poll a single data point from MSFS SimVars.
   * Called periodically when recording is active.
   */
  const pollOnce = () => {
    if (!startEpoch) return;
    try {
       // @ts-ignore SimVar is provided by MSFS runtime
      // @ts-ignore
      const alt_ft = Number(SimVar.GetSimVarValue("PLANE ALTITUDE", "feet"));
      // @ts-ignore
      const kias = Number(SimVar.GetSimVarValue("AIRSPEED INDICATED", "knots"));
      const t = (Date.now() - startEpoch) / 1000;
      if (Number.isFinite(alt_ft) && Number.isFinite(kias)) {
        setSamples((prev) => [...prev, { t, alt_ft, kias }]);
      }
    } catch (err) {
      console.error("Issue reading SimVars:", err);
    }
  };

  /** Start recording samples */
  const startRecording = () => {
    setSamples([]);
    setStartEpoch(Date.now());
    setIsRecording(true);
  };
    /** Stop recording samples */
  const stopRecording = () => {
    setIsRecording(false);
    setStartEpoch(null);
  };

  // Handle polling interval lifecycle

  useEffect(() => {
    if (!isRecording) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(pollOnce, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isRecording]);

  // Chart dimensions
  const width = 600;
  const height = 300;
  const margin = 40;

  // Dynamic ranges with fallback values
  const minAlt =
    samples.length > 1
      ? Math.min(...samples.map((s) => s.alt_ft)) * 0.9
      : 0;
  const maxAlt =
    samples.length > 1
      ? Math.max(...samples.map((s) => s.alt_ft)) * 1.1
      : 10000;

  const minSpd =
    samples.length > 1
      ? Math.min(...samples.map((s) => s.kias)) * 0.9
      : 0;
  const maxSpd =
    samples.length > 1
      ? Math.max(...samples.map((s) => s.kias)) * 1.1
      : 300;

  const minT = samples.length ? Math.min(...samples.map((s) => s.t)) : 0;
  const maxT = samples.length ? Math.max(...samples.map((s) => s.t)) : 30;

  // Apply zoom and pan to time axis
const timeRange = (maxT - minT) || 1;
const effectiveTimeRange = timeRange / zoom;

const scaleX = (t: number) =>
  margin +
  ((t - (minT + offset)) / effectiveTimeRange) *
    (width - 2 * margin);

  const scaleY = (val: number) =>
    mode === "altitude"
      ? height -
        margin -
        ((val - minAlt) / (maxAlt - minAlt || 1)) * (height - 2 * margin)
      : height -
        margin -
        ((val - minSpd) / (maxSpd - minSpd || 1)) * (height - 2 * margin);

        // Build points string for polyline
  const points = samples
    .map((d) =>
      `${scaleX(d.t)},${scaleY(mode === "altitude" ? d.alt_ft : d.kias)}`
    )
    .join(" ");

  // Mouse drag for horizontal panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setLastX(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && lastX !== null) {
      const deltaX = e.clientX - lastX;
      const timeDelta = (deltaX / (width - 2 * margin)) * effectiveTimeRange;
      setOffset((prev) =>
        Math.max(0, Math.min(prev - timeDelta, maxT - effectiveTimeRange))
      );
      setLastX(e.clientX);
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    setLastX(null);
  };

  // Dynamic Y-axis ticks (5 steps)
  const numTicks = 5;
  const yTicks =
    mode === "altitude"
      ? Array.from({ length: numTicks }, (_, i) =>
          minAlt + ((maxAlt - minAlt) / (numTicks - 1)) * i
        )
      : Array.from({ length: numTicks }, (_, i) =>
          minSpd + ((maxSpd - minSpd) / (numTicks - 1)) * i
        );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "background.paper",
        mb: 3, 
      }}
    >
        {/* Header with title */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: "background.paper" }}>
        <Toolbar>
          <TimelineIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: "text.primary" }}>
            Descent Profile - Real MSFS Data
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Controls */}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        sx={{ my: 2 }}
      >
        <ToggleButtonGroup
          size="small"
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
        >
          <ToggleButton value="altitude">
            <AltRouteIcon sx={{ mr: 1, color: "primary.main" }} /> Altitude
          </ToggleButton>
          <ToggleButton value="speed">
            <SpeedIcon sx={{ mr: 1, color: "primary.main" }} /> Speed
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<ZoomInIcon />}
            onClick={() => setZoom((z) => Math.min(z * 1.5, 10))}
          >
            Zoom In
          </Button>
          <Button
            variant="outlined"
            startIcon={<ZoomOutIcon />}
            onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          >
            Zoom Out
          </Button>
          {!isRecording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={startRecording}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Chart */}
      <Box sx={{ width: "100%", height: 260 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{
            background: "#0b0f13",
            borderRadius: "12px",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Axes */}
          <line
            x1={margin}
            y1={height - margin}
            x2={width - margin}
            y2={height - margin}
            stroke="#555"
            strokeWidth={2}
          />
          <line
            x1={margin}
            y1={margin}
            x2={margin}
            y2={height - margin}
            stroke="#555"
            strokeWidth={2}
          />

          {/* Grid + labels */}
          {yTicks.map((val, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={margin}
                y1={scaleY(val)}
                x2={width - margin}
                y2={scaleY(val)}
                stroke="#333"
                strokeDasharray="4"
              />
              <text
                x={margin - 12}
                y={scaleY(val) + 5}
                fill="#cccccc"
                fontSize="12"
                textAnchor="end"
              >
                {val.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Polyline path */}
          <polyline
            fill="none"
            stroke={mode === "altitude" ? "#00ff9c" : "#ff6600"}
            strokeWidth={3}
            points={points}
          />

          {/* Circles for each sample */}
          {samples.map((d, i) => (
            <circle
              key={i}
              cx={scaleX(d.t)}
              cy={scaleY(mode === "altitude" ? d.alt_ft : d.kias)}
              r={4}
              fill={mode === "altitude" ? "#00ff9c" : "#ff6600"}
              stroke="#ffffff"
              strokeWidth={1}
            />
          ))}
        </svg>
      </Box>
    </Paper>
  );
};

export default SpeedChart;



