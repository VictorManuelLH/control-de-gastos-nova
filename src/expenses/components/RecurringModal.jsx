import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    Grid,
    InputAdornment,
    Box,
    Typography,
    Chip,
    Autocomplete,
    Alert
} from '@mui/material';
import {
    Save,
    Close,
    AttachMoney,
    Event,
    Repeat,
    Category
} from '@mui/icons-material';
import { startNewRecurring, startUpdatingRecurring } from '../../store/recurring/thunks';
import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES, FREQUENCY_METADATA, COMMON_SUBSCRIPTIONS } from '../../constants';
import { format, addDays } from 'date-fns';

export const RecurringModal = ({ open, onClose, recurringToEdit = null }) => {
    const dispatch = useDispatch();
    const { isSaving } = useSelector(state => state.recurring);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        amount: '',
        frequency: RECURRING_FREQUENCIES.MONTHLY,
        nextDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        description: ''
    });

    const [errors, setErrors] = useState({});

    // Cargar datos si es edición
    useEffect(() => {
        if (recurringToEdit) {
            setFormData({
                name: recurringToEdit.name || '',
                category: recurringToEdit.category || '',
                amount: recurringToEdit.amount?.toString() || '',
                frequency: recurringToEdit.frequency || RECURRING_FREQUENCIES.MONTHLY,
                nextDate: recurringToEdit.nextDate
                    ? format(new Date(recurringToEdit.nextDate), 'yyyy-MM-dd')
                    : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                description: recurringToEdit.description || ''
            });
        } else {
            // Resetear form si es nuevo
            setFormData({
                name: '',
                category: '',
                amount: '',
                frequency: RECURRING_FREQUENCIES.MONTHLY,
                nextDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                description: ''
            });
        }
        setErrors({});
    }, [recurringToEdit, open]);

    const handleChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
        // Limpiar error del campo
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const handleSubscriptionSelect = (event, value) => {
        if (value) {
            setFormData({
                ...formData,
                name: value.name,
                category: value.category,
                amount: value.avgAmount?.toString() || ''
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.category) {
            newErrors.category = 'Selecciona una categoría';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Ingresa un monto válido';
        }

        if (!formData.nextDate) {
            newErrors.nextDate = 'Selecciona la fecha del próximo cargo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const recurringData = {
            name: formData.name.trim(),
            category: formData.category,
            amount: parseFloat(formData.amount),
            frequency: formData.frequency,
            nextDate: new Date(formData.nextDate).getTime(),
            description: formData.description.trim()
        };

        if (recurringToEdit) {
            // Actualizar
            dispatch(startUpdatingRecurring({
                ...recurringData,
                id: recurringToEdit.id
            }));
        } else {
            // Crear nuevo
            dispatch(startNewRecurring(recurringData));
        }

        onClose();
    };

    const frequencyInfo = useMemo(() => {
        return FREQUENCY_METADATA[formData.frequency];
    }, [formData.frequency]);

    const selectedCategory = useMemo(() => {
        return EXPENSE_CATEGORIES.find(c => c.id === formData.category);
    }, [formData.category]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Repeat sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                        {recurringToEdit ? 'Editar Gasto Recurrente' : 'Nuevo Gasto Recurrente'}
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Configura un gasto que se registra automáticamente
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Sugerencias de suscripciones comunes */}
                    {!recurringToEdit && (
                        <Grid item xs={12}>
                            <Autocomplete
                                options={COMMON_SUBSCRIPTIONS}
                                getOptionLabel={(option) => `${option.icon} ${option.name}`}
                                onChange={handleSubscriptionSelect}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="O selecciona una suscripción común"
                                        placeholder="Netflix, Spotify, Gym..."
                                        size="small"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <Typography sx={{ fontSize: 20 }}>{option.icon}</Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2">{option.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ${option.avgAmount} aprox.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </li>
                                )}
                            />
                        </Grid>
                    )}

                    {/* Nombre */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nombre del gasto *"
                            placeholder="Netflix, Gym, Renta..."
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={!!errors.name}
                            helperText={errors.name}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Repeat />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Categoría */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.category}>
                            <InputLabel>Categoría *</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={handleChange('category')}
                                label="Categoría *"
                                startAdornment={
                                    selectedCategory && (
                                        <InputAdornment position="start">
                                            <Typography sx={{ fontSize: 20 }}>
                                                {selectedCategory.icon}
                                            </Typography>
                                        </InputAdornment>
                                    )
                                }
                            >
                                {EXPENSE_CATEGORIES.map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: 20 }}>{category.icon}</Typography>
                                            <Typography>{category.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.category && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                    {errors.category}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Monto */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Monto *"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleChange('amount')}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Frecuencia */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Frecuencia *</InputLabel>
                            <Select
                                value={formData.frequency}
                                onChange={handleChange('frequency')}
                                label="Frecuencia *"
                            >
                                {Object.values(RECURRING_FREQUENCIES).map(freq => {
                                    const meta = FREQUENCY_METADATA[freq];
                                    return (
                                        <MenuItem key={freq} value={freq}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>{meta.icon}</Typography>
                                                <Typography>{meta.name}</Typography>
                                                <Chip
                                                    label={meta.description}
                                                    size="small"
                                                    sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Próxima fecha */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Próximo cargo *"
                            value={formData.nextDate}
                            onChange={handleChange('nextDate')}
                            error={!!errors.nextDate}
                            helperText={errors.nextDate || 'Fecha del próximo cargo'}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Event />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Info de frecuencia */}
                    <Grid item xs={12} md={6}>
                        <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2">
                                {frequencyInfo?.icon} Se repetirá <strong>{frequencyInfo?.description.toLowerCase()}</strong>
                            </Typography>
                        </Alert>
                    </Grid>

                    {/* Descripción */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Descripción (opcional)"
                            placeholder="Notas adicionales sobre este gasto..."
                            value={formData.description}
                            onChange={handleChange('description')}
                        />
                    </Grid>

                    {/* Preview del costo mensual */}
                    {formData.amount && formData.frequency && (
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'primary.light',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'primary.main'
                                }}
                            >
                                <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                                    💰 Impacto Mensual Estimado:
                                </Typography>
                                <Typography variant="h6" color="primary.main">
                                    ${((parseFloat(formData.amount) || 0) * (30 / (frequencyInfo?.days || 30))).toFixed(2)} / mes
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
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
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    {recurringToEdit ? 'Actualizar' : 'Crear'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
