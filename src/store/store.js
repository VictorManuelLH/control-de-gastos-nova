import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './auth'
import { expensesSlice, journalSlice } from './journal'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        journal: journalSlice.reducer,
        expenses: expensesSlice.reducer,
    },
})