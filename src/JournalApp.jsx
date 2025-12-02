import { AppRouter } from "./router/AppRouter"
import { AppTheme } from "./theme"
import { ThemeProvider } from "./context"
import { InstallPWA } from "./components"

export const JournalApp = () => {
    return (
        <ThemeProvider>
            <AppTheme>
                <AppRouter />
                <InstallPWA />
            </AppTheme>
        </ThemeProvider>
    )
}
