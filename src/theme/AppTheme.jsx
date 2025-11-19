import { ThemeProvider as MuiThemeProvider } from "@emotion/react"
import { CssBaseline } from "@mui/material"
import { useThemeContext } from "../context/ThemeContext"
import { themes } from "./themes"

export const AppTheme = ({ children }) => {
    const { currentTheme } = useThemeContext();

    // Seleccionar el tema basado en el contexto
    const selectedTheme = themes[currentTheme] || themes.light;

    return (
        <MuiThemeProvider theme={ selectedTheme }>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            { children }
        </MuiThemeProvider>
    )
}
