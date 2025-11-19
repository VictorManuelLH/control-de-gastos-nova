import { Navigate, Route, Routes } from "react-router-dom"
import { JournalPage } from "../pages"
import { ExpensesPage, BudgetsPage, TelegramConfigPage } from "../../expenses/pages"

export const JournalRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={ <JournalPage /> } />
            <Route path="/expenses" element={ <ExpensesPage /> } />
            <Route path="/budgets" element={ <BudgetsPage /> } />
            <Route path="/telegram" element={ <TelegramConfigPage /> } />

            <Route path="/*" element={ <Navigate to="/" /> } />
        </Routes>
    )
}
