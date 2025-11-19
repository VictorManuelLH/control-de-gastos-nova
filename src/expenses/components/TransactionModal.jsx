import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton,
    Box,
    InputAdornment,
    Typography,
    Avatar,
    Grid,
    Chip
} from '@mui/material';
import {
    TrendingDown,
    TrendingUp,
    Save,
    Close
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { startNewTransaction, startSaveTransaction } from '../../store/expenses/thunks';
import { setActiveTransaction } from '../../store/expenses/expensesSlice';
import { TRANSACTION_TYPES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants';

export const TransactionModal = ({ open, onClose, editMode = false }) => {
    const dispatch = useDispatch();
    const { active, isSaving } = useSelector(state => state.expenses);

    const [formData, setFormData] = useState({
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Cargar datos si estamos en modo edición
    useEffect(() => {
        if (editMode && active) {
            setFormData({
                type: active.type || TRANSACTION_TYPES.EXPENSE,
                amount: active.amount || '',
                category: active.category || '',
                description: active.description || '',
                date: active.date ? new Date(active.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } else if (!editMode) {
            // Resetear formulario si no estamos editando
            setFormData({
                type: TRANSACTION_TYPES.EXPENSE,
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [editMode, active, open]);

    // Categorías según el tipo seleccionado
    const categories = useMemo(() => {
        return formData.type === TRANSACTION_TYPES.EXPENSE
            ? EXPENSE_CATEGORIES
            : INCOME_CATEGORIES;
    }, [formData.type]);

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setFormData({
                ...formData,
                type: newType,
                category: '' // Resetear categoría al cambiar tipo
            });
        }
    };

    const handleChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleSubmit = () => {
        // Validaciones
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }

        if (!formData.category) {
            alert('Por favor selecciona una categoría');
            return;
        }

        const transactionData = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            category: formData.category,
            description: formData.description.trim(),
            date: new Date(formData.date).getTime()
        };

        if (editMode && active) {
            // Actualizar transacción existente
            dispatch(setActiveTransaction({
                ...active,
                ...transactionData,
                updatedAt: new Date().getTime()
            }));
            dispatch(startSaveTransaction());
        } else {
            // Crear nueva transacción
            dispatch(startNewTransaction(transactionData));
        }

        onClose();
    };

    const isExpense = formData.type === TRANSACTION_TYPES.EXPENSE;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: isExpense
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    py: 2
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    {isExpense ? <TrendingDown /> : <TrendingUp />}
                    <Typography variant="h6" fontWeight={600}>
                        {editMode ? 'Editar Transacción' : 'Nueva Transacción'}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box display="flex" flexDirection="column" gap={2.5}>
                    {/* Selector de Tipo */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Tipo de transacción
                        </Typography>
                        <ToggleButtonGroup
                            value={formData.type}
                            exclusive
                            onChange={handleTypeChange}
                            fullWidth
                            sx={{
                                '& .MuiToggleButton-root': {
                                    py: 1.5,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }
                            }}
                        >
                            <ToggleButton
                                value={TRANSACTION_TYPES.EXPENSE}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'error.dark'
                                        }
                                    }
                                }}
                            >
                                <TrendingDown sx={{ mr: 1 }} />
                                Gasto
                            </ToggleButton>
                            <ToggleButton
                                value={TRANSACTION_TYPES.INCOME}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'success.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'success.dark'
                                        }
                                    }
                                }}
                            >
                                <TrendingUp sx={{ mr: 1 }} />
                                Ingreso
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Campo de Monto */}
                    <TextField
                        label="Monto"
                        type="number"
                        fullWidth
                        value={formData.amount}
                        onChange={handleChange('amount')}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{
                            min: 0,
                            step: 0.01
                        }}
                        required
                    />

                    {/* Selector de Categoría */}
                    <FormControl fullWidth required>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                            value={formData.category}
                            onChange={handleChange('category')}
                            label="Categoría"
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: cat.color,
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {cat.icon}
                                        </Avatar>
                                        <Typography>{cat.name}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Campo de Descripción */}
                    <TextField
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleChange('description')}
                        placeholder={isExpense
                            ? "Ej: Compras del supermercado"
                            : "Ej: Pago de salario mensual"
                        }
                    />

                    {/* Selector de Fecha */}
                    <TextField
                        label="Fecha"
                        type="date"
                        fullWidth
                        value={formData.date}
                        onChange={handleChange('date')}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<Close />}
                    disabled={isSaving}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isSaving}
                    sx={{
                        background: isExpense
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        '&:hover': {
                            opacity: 0.9
                        }
                    }}
                >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
