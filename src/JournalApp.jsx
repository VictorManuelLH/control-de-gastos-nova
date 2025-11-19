import { AppRouter } from "./router/AppRouter"
import { AppTheme } from "./theme"
import { ThemeProvider } from "./context"

export const JournalApp = () => {
    return (
        <ThemeProvider>
            <AppTheme>
                <AppRouter />
            </AppTheme>
        </ThemeProvider>
    )
}
