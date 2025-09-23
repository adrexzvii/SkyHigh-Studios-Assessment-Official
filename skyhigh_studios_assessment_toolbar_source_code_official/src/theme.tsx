import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0b0f13", // fondo principal
      paper: "#121212",   // cards / paneles
    },
    primary: {
      main: "#00ff9c",    // verde neón SkyHigh
    },
    secondary: {
      main: "#ffffff",    // blanco
    },
    text: {
      primary: "#ffffff", // texto principal
      secondary: "#cccccc", // texto gris
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    fontWeightBold: 700,
  },
});

export default darkTheme;
