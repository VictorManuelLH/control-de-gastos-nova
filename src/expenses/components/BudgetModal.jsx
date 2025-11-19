import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
    Stack,
    InputAdornment,
    Typography,
    Slider,
    Box,
    Chip
} from '@mui/material';
import {
    AttachMoney,
    NotificationsActive
} from '@mui/icons-material';
import { startNewBudget, startUpdatingBudget } from '../../store/budgets/thunks';
import { EXPENSE_CATEGORIES, BUDGET_PERIODS } from '../../constants';

/**
 * Modal para crear o editar presupuestos
 *
 * @param {Object} props
 * @param {boolean} props.open - Si el modal está abierto
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Object} props.budget - Presupuesto a editar (null para crear nuevo)
 */
export const BudgetModal = ({ open, onClose, budget = null }) => {
    const dispatch = useDispatch();
    const isEditing = !!budget;

    // Obtener fecha actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Estado del formulario
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        period: BUDGET_PERIODS.MONTHLY,
        year: currentYear,
        month: currentMonth,
        alertThreshold: 80,
        enabled: true
    });

    // Cargar datos si estamos editando
    useEffect(() => {
        if (budget) {
            setFormData({
                categoryId: budget.categoryId || '',
                amount: budget.amount || '',
                period: budget.period || BUDGET_PERIODS.MONTHLY,
                year: budget.year || currentYear,
                month: budget.month !== null ? budget.month : currentMonth,
                alertThreshold: budget.alertThreshold || 80,
                enabled: budget.enabled !== undefined ? budget.enabled : true
            });
        } else {
            // Reset para nuevo presupuesto
            setFormData({
                categoryId: '',
                amount: '',
                period: BUDGET_PERIODS.MONTHLY,
                year: currentYear,
                month: currentMonth,
                alertThreshold: 80,
                enabled: true
            });
        }
    }, [budget, currentYear, currentMonth]);

    // Manejar cambios en el formulario
    const handleChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    // Manejar cambio en el slider
    const handleSliderChange = (event, newValue) => {
        setFormData({
            ...formData,
            alertThreshold: newValue
        });
    };

    // Validar formulario
    const isValid = () => {
        return (
            formData.categoryId &&
            formData.amount &&
            parseFloat(formData.amount) > 0
        );
    };

    // Manejar submit
    const handleSubmit = () => {
        if (!isValid()) return;

        if (isEditing) {
            // Actualizar presupuesto existente
            dispatch(startUpdatingBudget({
                ...budget,
                ...formData,
                amount: parseFloat(formData.amount)
            }));
        } else {
            // Crear nuevo presupuesto
            dispatch(startNewBudget({
                ...formData,
                amount: parseFloat(formData.amount)
            }));
        }

        handleClose();
    };

    // Manejar cierre
    const handleClose = () => {
        setFormData({
            categoryId: '',
            amount: '',
            period: BUDGET_PERIODS.MONTHLY,
            year: currentYear,
            month: currentMonth,
            alertThreshold: 80,
            enabled: true
        });
        onClose();
    };

    // Obtener meses
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Generar años (5 años hacia atrás y 2 hacia adelante)
    const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AttachMoney sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                        {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {/* Categoría */}
                    <FormControl fullWidth>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                            value={formData.categoryId}
                            onChange={handleChange('categoryId')}
                            label="Categoría"
                            disabled={isEditing} // No permitir cambiar categoría al editar
                        >
                            {EXPENSE_CATEGORIES.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                                        <span>{category.name}</span>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Monto */}
                    <TextField
                        label="Monto del Presupuesto"
                        type="number"
                        fullWidth
                        value={formData.amount}
                        onChange={handleChange('amount')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                            )
                        }}
                        helperText="Ingresa el monto total del presupuesto"
                    />

                    {/* Período */}
                    <FormControl fullWidth>
                        <InputLabel>Período</InputLabel>
                        <Select
                            value={formData.period}
                            onChange={handleChange('period')}
                            label="Período"
                            disabled={isEditing} // No permitir cambiar período al editar
                        >
                            <MenuItem value={BUDGET_PERIODS.MONTHLY}>Mensual</MenuItem>
                            <MenuItem value={BUDGET_PERIODS.YEARLY}>Anual</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Año y Mes (si es mensual) */}
                    <Stack direction="row" spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel>Año</InputLabel>
                            <Select
                                value={formData.year}
                                onChange={handleChange('year')}
                                label="Año"
                                disabled={isEditing}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.period === BUDGET_PERIODS.MONTHLY && (
                            <FormControl fullWidth>
                                <InputLabel>Mes</InputLabel>
                                <Select
                                    value={formData.month}
                                    onChange={handleChange('month')}
                                    label="Mes"
                                    disabled={isEditing}
                                >
                                    {months.map((month, index) => (
                                        <MenuItem key={index} value={index}>
                                            {month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>

                    {/* Umbral de Alerta */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <NotificationsActive sx={{ fontSize: 20, color: 'warning.main' }} />
                            <Typography variant="body2" fontWeight={500}>
                                Alertarme al alcanzar el {formData.alertThreshold}%
                            </Typography>
                        </Stack>

                        <Slider
                            value={formData.alertThreshold}
                            onChange={handleSliderChange}
                            min={50}
                            max={100}
                            step={5}
                            marks={[
                                { value: 50, label: '50%' },
                                { value: 75, label: '75%' },
                                { value: 100, label: '100%' }
                            ]}
                            valueLabelDisplay="auto"
                            sx={{
                                '& .MuiSlider-markLabel': {
                                    fontSize: '0.75rem'
                                }
                            }}
                        />

                        <Typography variant="caption" color="text.secondary">
                            Recibirás una alerta cuando gastes más de este porcentaje
                        </Typography>
                    </Box>

                    {/* Estado */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">Estado:</Typography>
                        <Chip
                            label={formData.enabled ? 'Activo' : 'Desactivado'}
                            color={formData.enabled ? 'success' : 'default'}
                            size="small"
                            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid()}
                    sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    {isEditing ? 'Actualizar' : 'Crear'} Presupuesto
                </Button>
            </DialogActions>
        </Dialog>
    );
};
