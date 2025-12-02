import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Switch,
    Stack,
    Divider,
    TextField,
    FormControlLabel,
    FormGroup,
    Chip,
    Alert,
    AlertTitle,
    Button,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import {
    Notifications,
    NotificationsActive,
    Warning,
    TrendingUp,
    CalendarToday,
    Delete,
    Save
} from '@mui/icons-material';
import { Navbar } from '../../journal/components';
import { notificationTrackingService } from '../../services';
import Swal from 'sweetalert2';

export const NotificationSettingsPage = () => {
    const [preferences, setPreferences] = useState(notificationTrackingService.getPreferences());
    const [stats, setStats] = useState(notificationTrackingService.getNotificationStats());
    const [hasChanges, setHasChanges] = useState(false);

    // Cargar preferencias al montar
    useEffect(() => {
        const prefs = notificationTrackingService.getPreferences();
        setPreferences(prefs);
        setStats(notificationTrackingService.getNotificationStats());
    }, []);

    const handleBudgetAlertsToggle = (event) => {
        setPreferences({
            ...preferences,
            budgetAlerts: {
                ...preferences.budgetAlerts,
                enabled: event.target.checked
            }
        });
        setHasChanges(true);
    };

    const handleBudgetThresholdToggle = (threshold) => {
        setPreferences({
            ...preferences,
            budgetAlerts: {
                ...preferences.budgetAlerts,
                thresholds: {
                    ...preferences.budgetAlerts.thresholds,
                    [threshold]: !preferences.budgetAlerts.thresholds[threshold]
                }
            }
        });
        setHasChanges(true);
    };

    const handleTransactionNotificationsToggle = (event) => {
        setPreferences({
            ...preferences,
            transactionNotifications: {
                ...preferences.transactionNotifications,
                enabled: event.target.checked
            }
        });
        setHasChanges(true);
    };

    const handleMinAmountChange = (event) => {
        const value = parseFloat(event.target.value) || 0;
        setPreferences({
            ...preferences,
            transactionNotifications: {
                ...preferences.transactionNotifications,
                minAmount: value
            }
        });
        setHasChanges(true);
    };

    const handleTransactionTypeToggle = (type) => {
        const field = type === 'expense' ? 'notifyExpenses' : 'notifyIncome';
        setPreferences({
            ...preferences,
            transactionNotifications: {
                ...preferences.transactionNotifications,
                [field]: !preferences.transactionNotifications[field]
            }
        });
        setHasChanges(true);
    };

    const handleSummaryToggle = (summaryType, field, value) => {
        setPreferences({
            ...preferences,
            summaries: {
                ...preferences.summaries,
                [summaryType]: {
                    ...preferences.summaries[summaryType],
                    [field]: value
                }
            }
        });
        setHasChanges(true);
    };

    const handleSave = () => {
        notificationTrackingService.savePreferences(preferences);
        setHasChanges(false);

        Swal.fire({
            title: '¡Guardado!',
            text: 'Tus preferencias de notificaciones han sido actualizadas',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleReset = () => {
        const prefs = notificationTrackingService.getPreferences();
        setPreferences(prefs);
        setHasChanges(false);

        Swal.fire({
            title: 'Cambios descartados',
            text: 'Se han restaurado las preferencias guardadas',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleClearTracking = async () => {
        const result = await Swal.fire({
            title: '¿Limpiar historial de notificaciones?',
            text: 'Esto permitirá que se envíen nuevamente las alertas de presupuesto',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            notificationTrackingService.clearBudgetAlerts();
            setStats(notificationTrackingService.getNotificationStats());

            Swal.fire({
                title: '¡Limpiado!',
                text: 'El historial de notificaciones ha sido eliminado',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar drawerWidth={240} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: `240px` },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg" sx={{ pt: 4, pb: 10 }}>
                    {/* Header */}
                    <Paper
                        sx={{
                            p: 4,
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <NotificationsActive sx={{ fontSize: 48, color: '#667eea' }} />
                            <Box>
                                <Typography variant="h4" fontWeight={700}>
                                    Preferencias de Notificaciones
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Personaliza qué notificaciones quieres recibir
                                </Typography>
                            </Box>
                        </Stack>

                        {hasChanges && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <AlertTitle>Cambios sin guardar</AlertTitle>
                                Tienes cambios pendientes. No olvides guardar tus preferencias.
                            </Alert>
                        )}
                    </Paper>

                    <Grid container spacing={3}>
                        {/* Alertas de Presupuesto */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <Warning sx={{ color: '#ff9800' }} />
                                        <Typography variant="h6" fontWeight={600}>
                                            Alertas de Presupuesto
                                        </Typography>
                                    </Stack>

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={preferences.budgetAlerts.enabled}
                                                onChange={handleBudgetAlertsToggle}
                                                color="primary"
                                            />
                                        }
                                        label="Activar alertas de presupuesto"
                                    />

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        Notificar cuando se alcance:
                                    </Typography>

                                    <FormGroup sx={{ pl: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preferences.budgetAlerts.thresholds[80]}
                                                    onChange={() => handleBudgetThresholdToggle(80)}
                                                    disabled={!preferences.budgetAlerts.enabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2">80% del presupuesto</Typography>
                                                    <Chip label="Advertencia" size="small" color="warning" />
                                                </Stack>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preferences.budgetAlerts.thresholds[90]}
                                                    onChange={() => handleBudgetThresholdToggle(90)}
                                                    disabled={!preferences.budgetAlerts.enabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2">90% del presupuesto</Typography>
                                                    <Chip label="Crítico" size="small" color="error" />
                                                </Stack>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preferences.budgetAlerts.thresholds[100]}
                                                    onChange={() => handleBudgetThresholdToggle(100)}
                                                    disabled={!preferences.budgetAlerts.enabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2">100% (Excedido)</Typography>
                                                    <Chip label="Excedido" size="small" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
                                                </Stack>
                                            }
                                        />
                                    </FormGroup>

                                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            <strong>Alertas enviadas:</strong> {stats.totalBudgetAlerts}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Notificaciones de Transacciones */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <TrendingUp sx={{ color: '#2196f3' }} />
                                        <Typography variant="h6" fontWeight={600}>
                                            Notificaciones de Transacciones
                                        </Typography>
                                    </Stack>

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={preferences.transactionNotifications.enabled}
                                                onChange={handleTransactionNotificationsToggle}
                                                color="primary"
                                            />
                                        }
                                        label="Activar notificaciones de transacciones"
                                    />

                                    <Divider sx={{ my: 2 }} />

                                    <TextField
                                        fullWidth
                                        label="Monto mínimo para notificar"
                                        type="number"
                                        value={preferences.transactionNotifications.minAmount}
                                        onChange={handleMinAmountChange}
                                        disabled={!preferences.transactionNotifications.enabled}
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                                        }}
                                        helperText="Solo se notificarán transacciones mayores a este monto"
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        Tipos de transacciones:
                                    </Typography>

                                    <FormGroup sx={{ pl: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preferences.transactionNotifications.notifyExpenses}
                                                    onChange={() => handleTransactionTypeToggle('expense')}
                                                    disabled={!preferences.transactionNotifications.enabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2">Gastos</Typography>
                                                    <Chip label="💸" size="small" />
                                                </Stack>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={preferences.transactionNotifications.notifyIncome}
                                                    onChange={() => handleTransactionTypeToggle('income')}
                                                    disabled={!preferences.transactionNotifications.enabled}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2">Ingresos</Typography>
                                                    <Chip label="💰" size="small" />
                                                </Stack>
                                            }
                                        />
                                    </FormGroup>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Resúmenes Automáticos */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                        <CalendarToday sx={{ color: '#9c27b0' }} />
                                        <Typography variant="h6" fontWeight={600}>
                                            Resúmenes Automáticos
                                        </Typography>
                                        <Chip label="Próximamente" size="small" color="info" />
                                    </Stack>

                                    <Grid container spacing={2}>
                                        {/* Resumen Diario */}
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={preferences.summaries.daily.enabled}
                                                            onChange={(e) => handleSummaryToggle('daily', 'enabled', e.target.checked)}
                                                            disabled
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            Resumen Diario
                                                        </Typography>
                                                    }
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Recibe un resumen de tus transacciones cada día
                                                </Typography>
                                                {stats.lastDailySummary && (
                                                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                                        Último: {new Date(stats.lastDailySummary).toLocaleDateString('es-MX')}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Grid>

                                        {/* Resumen Semanal */}
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={preferences.summaries.weekly.enabled}
                                                            onChange={(e) => handleSummaryToggle('weekly', 'enabled', e.target.checked)}
                                                            disabled
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            Resumen Semanal
                                                        </Typography>
                                                    }
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Recibe un análisis semanal de tus finanzas
                                                </Typography>
                                                {stats.lastWeeklySummary && (
                                                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                                        Último: {new Date(stats.lastWeeklySummary).toLocaleDateString('es-MX')}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Grid>

                                        {/* Resumen Mensual */}
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={preferences.summaries.monthly.enabled}
                                                            onChange={(e) => handleSummaryToggle('monthly', 'enabled', e.target.checked)}
                                                            disabled
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            Resumen Mensual
                                                        </Typography>
                                                    }
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Recibe un informe completo cada mes
                                                </Typography>
                                                {stats.lastMonthlySummary && (
                                                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                                        Último: {new Date(stats.lastMonthlySummary).toLocaleDateString('es-MX')}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Acciones */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap" useFlexGap>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSave}
                                            disabled={!hasChanges}
                                            sx={{
                                                bgcolor: '#667eea',
                                                '&:hover': { bgcolor: '#5568d3' }
                                            }}
                                        >
                                            Guardar Cambios
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            onClick={handleReset}
                                            disabled={!hasChanges}
                                        >
                                            Descartar
                                        </Button>
                                    </Stack>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Delete />}
                                        onClick={handleClearTracking}
                                        color="error"
                                    >
                                        Limpiar Historial
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};
