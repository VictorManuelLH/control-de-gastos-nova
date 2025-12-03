import { Navigate, Route, Routes } from "react-router-dom"
import { DashboardPage, ExpensesPage, BudgetsPage, TelegramConfigPage, NotificationSettingsPage, RecurringPage } from "../../expenses/pages"
import { JournalPage } from "../pages"

export const JournalRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={ <DashboardPage /> } />
            <Route path="/expenses" element={ <ExpensesPage /> } />
            <Route path="/notes" element={ <JournalPage /> } />
            <Route path="/budgets" element={ <BudgetsPage /> } />
            <Route path="/recurring" element={ <RecurringPage /> } />
            <Route path="/telegram" element={ <TelegramConfigPage /> } />
            <Route path="/notifications" element={ <NotificationSettingsPage /> } />

            <Route path="/*" element={ <Navigate to="/" /> } />
        </Routes>
    )
}
