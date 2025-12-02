import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './auth'
import { journalSlice } from './journal'
import { expensesSlice } from './expenses/expensesSlice'
import { budgetsSlice } from './budgets/budgetsSlice'
import { recurringSlice } from './recurring/recurringSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        journal: journalSlice.reducer,
        expenses: expensesSlice.reducer,
        budgets: budgetsSlice.reducer,
        recurring: recurringSlice.reducer,
    },
})