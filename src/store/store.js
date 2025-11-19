import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './auth'
import { journalSlice } from './journal'
import { expensesSlice } from './expenses/expensesSlice'
import { budgetsSlice } from './budgets/budgetsSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        journal: journalSlice.reducer,
        expenses: expensesSlice.reducer,
        budgets: budgetsSlice.reducer,
    },
})