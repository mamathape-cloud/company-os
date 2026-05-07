"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { amber, green, indigo, red } from "@mui/material/colors";
import { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

const theme = createTheme({
  palette: {
    primary: { main: indigo[600] },
    success: { main: green[500] },
    error: { main: red[500] },
    warning: { main: amber[500] }
  }
});

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
