import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    AlertTitle,
    Divider,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Grid
} from '@mui/material';
import {
    Telegram,
    Check,
    Close,
    Send,
    Info,
    ExpandMore,
    ExpandLess,
    DeleteOutline,
    Today,
    CalendarMonth,
    Assessment
} from '@mui/icons-material';
import { Navbar } from '../../journal/components';
import { telegramService, summaryService, notificationTrackingService, pwaNotificationService } from '../../services';
import Swal from 'sweetalert2';

export const TelegramConfigPage = () => {
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Obtener transacciones y presupuestos de Redux
    const { transactions } = useSelector(state => state.expenses);
    const { budgets } = useSelector(state => state.budgets);

    useEffect(() => {
        // Cargar configuración existente
        const configured = telegramService.loadConfig();
        setIsConfigured(configured);
        if (configured) {
            setBotToken(telegramService.botToken || '');
            setChatId(telegramService.chatId || '');
        }
    }, []);

    const handleSaveConfig = () => {
        if (!botToken || !chatId) {
            Swal.fire({
                title: 'Campos incompletos',
                text: 'Por favor completa ambos campos',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        telegramService.configure(botToken, chatId);
        setIsConfigured(true);
        setTestResult(null);

        Swal.fire({
            title: '¡Configuración guardada!',
            text: 'Tu bot de Telegram ha sido configurado',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleTestConnection = async () => {
        setLoading(true);
        setTestResult(null);

        const result = await telegramService.testConnection();
        setTestResult(result);
        setLoading(false);

        if (result.success) {
            Swal.fire({
                title: '¡Conexión exitosa!',
                text: `Bot conectado: @${result.botUsername}`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error de conexión',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleSendTestMessage = async () => {
        setLoading(true);

        const result = await telegramService.sendMessage(
            `🤖 <b>Mensaje de Prueba</b>\n\n✅ Tu bot de Telegram está funcionando correctamente.\n\n🎉 ¡Comenzarás a recibir notificaciones sobre tus finanzas!`
        );

        setLoading(false);

        if (result.success) {
            Swal.fire({
                title: '¡Mensaje enviado!',
                text: 'Revisa tu Telegram',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error al enviar',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleDeleteConfig = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar configuración?',
            text: 'Se desactivarán las notificaciones de Telegram',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            telegramService.clearConfig();
            setBotToken('');
            setChatId('');
            setIsConfigured(false);
            setTestResult(null);

            Swal.fire({
                title: 'Configuración eliminada',
                text: 'Notificaciones desactivadas',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    const handleSendDailySummary = async () => {
        setLoading(true);

        const summaryData = summaryService.generateDailySummary(transactions);
        const result = await telegramService.sendDailySummary(summaryData);

        setLoading(false);

        if (result.success) {
            notificationTrackingService.markSummaryAsSent('daily');
            // Enviar notificación PWA de éxito
            pwaNotificationService.notifySummarySent('daily');
            Swal.fire({
                title: '¡Resumen enviado!',
                text: 'Revisa tu Telegram',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error al enviar',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleSendWeeklySummary = async () => {
        setLoading(true);

        const summaryData = summaryService.generateWeeklySummary(transactions, budgets);
        const result = await telegramService.sendWeeklySummary(summaryData);

        setLoading(false);

        if (result.success) {
            notificationTrackingService.markSummaryAsSent('weekly');
            // Enviar notificación PWA de éxito
            pwaNotificationService.notifySummarySent('weekly');
            Swal.fire({
                title: '¡Resumen enviado!',
                text: 'Revisa tu Telegram',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error al enviar',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleSendMonthlySummary = async () => {
        setLoading(true);

        const summaryData = summaryService.generateMonthlySummary(transactions, budgets);
        const result = await telegramService.sendMonthlySummary(summaryData);

        setLoading(false);

        if (result.success) {
            notificationTrackingService.markSummaryAsSent('monthly');
            // Enviar notificación PWA de éxito
            pwaNotificationService.notifySummarySent('monthly');
            Swal.fire({
                title: '¡Resumen enviado!',
                text: 'Revisa tu Telegram',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error al enviar',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Entendido'
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
                <Container maxWidth="md" sx={{ pt: 4, pb: 10 }}>
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {/* Header */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <Telegram sx={{ fontSize: 48, color: '#0088cc' }} />
                            <Box>
                                <Typography variant="h4" fontWeight={700}>
                                    Configuración de Telegram
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Recibe notificaciones de tus finanzas en tiempo real
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* Status Badge */}
                        {isConfigured && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                <AlertTitle sx={{ fontWeight: 700 }}>✅ Telegram Configurado</AlertTitle>
                                Las notificaciones están activas. Recibirás alertas importantes.
                            </Alert>
                        )}

                        {/* Instrucciones */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                mb: 3,
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowInstructions(!showInstructions)}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Info color="primary" />
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        ¿Cómo obtener mis credenciales?
                                    </Typography>
                                </Stack>
                                <IconButton size="small">
                                    {showInstructions ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </Stack>

                            <Collapse in={showInstructions}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" component="div">
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Chip label="1" size="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Abre Telegram y busca @BotFather"
                                                secondary="Envía /newbot y sigue las instrucciones"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Chip label="2" size="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Copia el Token que te da BotFather"
                                                secondary="Se ve como: 110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Chip label="3" size="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Busca tu bot en Telegram y envíale /start"
                                                secondary="Esto inicia la conversación con el bot"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Chip label="4" size="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Visita: https://api.telegram.org/bot[TU_TOKEN]/getUpdates"
                                                secondary="Busca el campo 'chat':{'id': XXXXXXX} - Ese es tu Chat ID"
                                            />
                                        </ListItem>
                                    </List>
                                </Typography>
                            </Collapse>
                        </Paper>

                        {/* Formulario */}
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Bot Token"
                                placeholder="110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                helperText="Token proporcionado por @BotFather"
                                InputProps={{
                                    startAdornment: <Telegram sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Chat ID"
                                placeholder="123456789"
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                helperText="Tu ID personal de chat en Telegram"
                                type="number"
                            />

                            {/* Botones de acción */}
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                <Button
                                    variant="contained"
                                    startIcon={<Check />}
                                    onClick={handleSaveConfig}
                                    sx={{
                                        bgcolor: '#0088cc',
                                        '&:hover': { bgcolor: '#006699' }
                                    }}
                                >
                                    Guardar Configuración
                                </Button>

                                {isConfigured && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Info />}
                                            onClick={handleTestConnection}
                                            disabled={loading}
                                        >
                                            Probar Conexión
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            startIcon={<Send />}
                                            onClick={handleSendTestMessage}
                                            disabled={loading}
                                            color="success"
                                        >
                                            Enviar Mensaje de Prueba
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            startIcon={<DeleteOutline />}
                                            onClick={handleDeleteConfig}
                                            color="error"
                                        >
                                            Eliminar Configuración
                                        </Button>
                                    </>
                                )}
                            </Stack>

                            {/* Resultado de prueba */}
                            {testResult && (
                                <Alert
                                    severity={testResult.success ? 'success' : 'error'}
                                    icon={testResult.success ? <Check /> : <Close />}
                                >
                                    {testResult.success ? (
                                        <>
                                            <AlertTitle>✅ Conexión Exitosa</AlertTitle>
                                            Bot: @{testResult.botUsername} ({testResult.botName})
                                        </>
                                    ) : (
                                        <>
                                            <AlertTitle>❌ Error de Conexión</AlertTitle>
                                            {testResult.error}
                                        </>
                                    )}
                                </Alert>
                            )}
                        </Stack>

                        {isConfigured && (
                            <>
                                <Divider sx={{ my: 4 }} />

                                {/* Enviar resúmenes */}
                                <Box>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        📊 Enviar Resúmenes
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Envía un resumen de tus finanzas a Telegram
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    bgcolor: '#e3f2fd',
                                                    borderLeft: '4px solid #2196f3',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1
                                                }}
                                            >
                                                <Today sx={{ fontSize: 40, color: '#2196f3', mx: 'auto' }} />
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Resumen Diario
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Transacciones de hoy
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleSendDailySummary}
                                                    disabled={loading}
                                                    sx={{
                                                        mt: 'auto',
                                                        bgcolor: '#2196f3',
                                                        '&:hover': { bgcolor: '#1976d2' }
                                                    }}
                                                >
                                                    Enviar
                                                </Button>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    bgcolor: '#f3e5f5',
                                                    borderLeft: '4px solid #9c27b0',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1
                                                }}
                                            >
                                                <CalendarMonth sx={{ fontSize: 40, color: '#9c27b0', mx: 'auto' }} />
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Resumen Semanal
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Últimos 7 días
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleSendWeeklySummary}
                                                    disabled={loading}
                                                    sx={{
                                                        mt: 'auto',
                                                        bgcolor: '#9c27b0',
                                                        '&:hover': { bgcolor: '#7b1fa2' }
                                                    }}
                                                >
                                                    Enviar
                                                </Button>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    textAlign: 'center',
                                                    bgcolor: '#e8f5e9',
                                                    borderLeft: '4px solid #4caf50',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 1
                                                }}
                                            >
                                                <Assessment sx={{ fontSize: 40, color: '#4caf50', mx: 'auto' }} />
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Resumen Mensual
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Mes actual completo
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleSendMonthlySummary}
                                                    disabled={loading}
                                                    sx={{
                                                        mt: 'auto',
                                                        bgcolor: '#4caf50',
                                                        '&:hover': { bgcolor: '#388e3c' }
                                                    }}
                                                >
                                                    Enviar
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        )}

                        <Divider sx={{ my: 4 }} />

                        {/* Tipos de notificaciones */}
                        <Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                📬 Notificaciones que recibirás
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Una vez configurado, recibirás las siguientes alertas automáticas:
                            </Typography>

                            <Stack spacing={1.5}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="#e65100">
                                        ⚠️ Alertas de Presupuesto
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cuando uses el 80%, 90% o excedas un presupuesto
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="#1565c0">
                                        💸 Confirmación de Transacciones
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cada vez que registres un ingreso o gasto importante
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="#6a1b9a">
                                        📊 Resúmenes Periódicos
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Resumen semanal y mensual de tus finanzas (próximamente)
                                    </Typography>
                                </Paper>
                            </Stack>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};
