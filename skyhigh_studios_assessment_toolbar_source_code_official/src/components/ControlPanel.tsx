// import React, { useState } from "react";
// import {
//   Box,
//   Slider,
//   Typography,
//   IconButton,
//   Stack
// } from "@mui/material";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import StopIcon from "@mui/icons-material/Stop";

// interface AudioControlProps {
//   label: string;
//   isPlaying: boolean;
//   onToggle: () => void;
//   onVolumeChange?: (value: number) => void;
//   disabledPlay?: boolean;
// }

// const AudioControl: React.FC<AudioControlProps> = ({
//   label,
//   isPlaying,
//   onToggle,
//   onVolumeChange,
//   disabledPlay,
// }) => {
//   const handleVolume = (_: Event, value: number | number[]) => {
//     if (typeof value === "number" && onVolumeChange) {
//       onVolumeChange(value);
//     }
//   };

//   return (
//     <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
//       <Typography
//         variant="subtitle1"
//         sx={{ fontWeight: 600, color: "text.primary", alignSelf: "flex-start" }}
//       >
//         {label}
//       </Typography>
//       <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
//         <IconButton
//           disabled={disabledPlay}
//           onClick={onToggle}
//           sx={{
//     bgcolor: isPlaying ? "error.main" : "primary.main",
//     color: "background.default",
//     mr: 3,
//     transition: "background-color 0.2s ease-in-out",
//     ":hover": {
//       bgcolor: isPlaying ? "error.light" : "rgba(255, 255, 255, 0.1)", // 🔹 Hover más claro
//     },
//   }}
//         >
//           {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
//         </IconButton>
//         <Slider
//           defaultValue={100}
//           step={10}
//           min={0}
//           max={100}
//           onChange={handleVolume}
//           sx={{ color: "primary.main", flex: 1 }}
//         />
//       </Box>
//     </Stack>
//   );
// };

// const ControlPanel: React.FC = () => {
//   const [carPlaying, setCarPlaying] = useState(false);
//   const [cricketPlaying, setCricketPlaying] = useState(false);
//   const [landingPlaying, setLandingPlaying] = useState(false);

//   return (
//     <Box
//       sx={{
//         bgcolor: "background.paper",
//         p: 3,
//         borderRadius: 3,
//         display: "flex",
//         flexDirection: "column",
//         gap: 4,
//         width: 500,
//         mx: "auto",
//       }}
//     >
//       {/* SimObject: solo volumen */}
//       <AudioControl
//         label="SimObject Volume"
//         isPlaying={false}
//         onToggle={() => {}}
//         disabledPlay
//         onVolumeChange={(value) => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue("L:C53_SOUND_VOLUME", "number", value);
//           } catch (err) {
//             console.error("Error SimObject volume:", err);
//           }
//         }}
//       />

//       {/* Car */}
//       <AudioControl
//         label="Car sample"
//         isPlaying={carPlaying}
//         onToggle={() => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue("L:c53_oldcar", "number", carPlaying ? 0 : 1);
//             console.log("Car:", carPlaying ? "STOP" : "PLAY");
//           } catch (err) {
//             console.error("Error Car toggle:", err);
//           }
//           setCarPlaying(!carPlaying);
//         }}
//         onVolumeChange={(value) => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue("L:C53_CAR_VOLUME", "number", value);
//           } catch (err) {
//             console.error("Error Car volume:", err);
//           }
//         }}
//       />

//       {/* Cricket */}
//       <AudioControl
//         label="Cricket sample"
//         isPlaying={cricketPlaying}
//         onToggle={() => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue(
//               "L:c53_animals",
//               "number",
//               cricketPlaying ? 0 : 1
//             );
//             console.log("Cricket:", cricketPlaying ? "STOP" : "PLAY");
//           } catch (err) {
//             console.error("Error Cricket toggle:", err);
//           }
//           setCricketPlaying(!cricketPlaying);
//         }}
//         onVolumeChange={(value) => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue("L:C53_ANIMALS_VOLUME", "number", value);
//           } catch (err) {
//             console.error("Error Cricket volume:", err);
//           }
//         }}
//       />

//       {/* Landing */}
//       <AudioControl
//         label="Landing sample"
//         isPlaying={landingPlaying}
//         onToggle={() => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue(
//               "L:c53_landingg",
//               "number",
//               landingPlaying ? 0 : 1
//             );
//             console.log("Landing:", landingPlaying ? "STOP" : "PLAY");
//           } catch (err) {
//             console.error("Error Landing toggle:", err);
//           }
//           setLandingPlaying(!landingPlaying);
//         }}
//         onVolumeChange={(value) => {
//           try {
//             // @ts-ignore
//             SimVar.SetSimVarValue("L:C53_LANDING_VOLUME", "number", value);
//           } catch (err) {
//             console.error("Error Landing volume:", err);
//           }
//         }}
//       />
//     </Box>
//   );
// };

// export default ControlPanel;
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

interface AudioControlProps {
  label: string;
  isPlaying: boolean;
  onToggle: () => void;
  value: number;
  onVolumeChange?: (value: number) => void;
  disabledPlay?: boolean;
}

const AudioControl: React.FC<AudioControlProps> = ({
  label,
  isPlaying,
  onToggle,
  value,
  onVolumeChange,
  disabledPlay,
}) => {
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

const ControlPanel: React.FC = () => {
  const [carPlaying, setCarPlaying] = useState(false);
  const [cricketPlaying, setCricketPlaying] = useState(false);
  const [landingPlaying, setLandingPlaying] = useState(false);

  // estados de volumen
  const [carVolume, setCarVolume] = useState(100);
  const [cricketVolume, setCricketVolume] = useState(100);
  const [landingVolume, setLandingVolume] = useState(100);

  // cuando se monta el componente → después de 2s mandar valor inicial
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
      {/* SimObject: solo volumen */}
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

      {/* Car */}
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

      {/* Cricket */}
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

      {/* Landing */}
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
