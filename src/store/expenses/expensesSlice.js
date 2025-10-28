// src/store/expenses/expensesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expenses: JSON.parse(localStorage.getItem('expenses')) || [],
};

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
      localStorage.setItem('expenses', JSON.stringify(state.expenses));
    },
    addExpense: (state, action) => {
      state.expenses.push(action.payload);
      localStorage.setItem('expenses', JSON.stringify(state.expenses));
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
      localStorage.setItem('expenses', JSON.stringify(state.expenses));
    },
  },
});

export const { setExpenses, addExpense, deleteExpense } = expensesSlice.actions;


// 

// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   isSaving: false,
//   messageSaved: '',
//   expenses: JSON.parse(localStorage.getItem('expenses')) || [],
//   active: null,
//   categories: ['Comida', 'Transporte', 'Entretenimiento', 'Hogar', 'Otros'],
// };

// export const expensesSlice = createSlice({
//   name: 'expenses',
//   initialState,
//   reducers: {
//     startSavingExpense: (state) => {
//       state.isSaving = true;
//     },

//     addNewExpense: (state, action) => {
//       state.expenses.push(action.payload);
//       state.isSaving = false;
//       localStorage.setItem('expenses', JSON.stringify(state.expenses));
//     },

//     setActiveExpense: (state, action) => {
//       state.active = action.payload;
//       state.messageSaved = '';
//       const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
//       if (index !== -1) {
//         state.expenses[index] = state.active;
//       }
//       localStorage.setItem('expenses', JSON.stringify(state.expenses));
//     },

//     setExpenses: (state, action) => {
//       state.expenses = action.payload;
//       localStorage.setItem('expenses', JSON.stringify(state.expenses));
//     },

//     updateExpense: (state, action) => {
//       state.isSaving = false;
//       state.expenses = state.expenses.map(exp =>
//         exp.id === action.payload.id ? action.payload : exp
//       );
//       localStorage.setItem('expenses', JSON.stringify(state.expenses));
//       state.messageSaved = `Gasto "${action.payload.description}" actualizado correctamente.`;
//     },

//     deleteExpenseById: (state, action) => {
//       state.active = null;
//       state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
//       localStorage.setItem('expenses', JSON.stringify(state.expenses));
//     },

//     clearExpensesLogout: (state) => {
//       state.isSaving = false;
//       state.messageSaved = '';
//       state.expenses = [];
//       state.active = null;
//       localStorage.removeItem('expenses');
//     },
//   },
// });

// export const {
//   startSavingExpense,
//   addNewExpense,
//   setActiveExpense,
//   setExpenses,
//   updateExpense,
//   deleteExpenseById,
//   clearExpensesLogout,
// } = expensesSlice.actions;
