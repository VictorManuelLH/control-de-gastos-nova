import { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Stack,
    Chip,
    Badge,
    Tooltip,
    Alert,
    AlertTitle,
    Paper
} from '@mui/material';
import {
    Close,
    Notifications,
    NotificationsActive,
    Delete,
    DoneAll,
    Warning,
    TrendingUp,
    CheckCircle,
    Info,
    DeleteSweep,
    NotificationsOff
} from '@mui/icons-material';
import { pwaNotificationService, NotificationType } from '../../services';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationCenter = ({ open, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [permissionStatus, setPermissionStatus] = useState('default');

    useEffect(() => {
        // Cargar notificaciones iniciales
        setNotifications(pwaNotificationService.getNotifications());
        setUnreadCount(pwaNotificationService.getUnreadCount());
        setPermissionStatus(pwaNotificationService.getPermissionStatus());

        // Suscribirse a cambios
        const unsubscribe = pwaNotificationService.subscribe((newNotifications, newUnreadCount) => {
            setNotifications(newNotifications);
            setUnreadCount(newUnreadCount);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkAllAsRead = () => {
        pwaNotificationService.markAllAsRead();
    };

    const handleClearAll = () => {
        pwaNotificationService.clearAll();
    };

    const handleDismiss = (notificationId) => {
        pwaNotificationService.dismissNotification(notificationId);
    };

    const handleMarkAsRead = (notificationId) => {
        pwaNotificationService.markAsRead(notificationId);
    };

    const handleRequestPermission = async () => {
        const permission = await pwaNotificationService.requestPermission();
        setPermissionStatus(permission);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case NotificationType.BUDGET_ALERT:
                return <Warning color="warning" />;
            case NotificationType.TRANSACTION:
                return <TrendingUp color="primary" />;
            case NotificationType.SUCCESS:
                return <CheckCircle color="success" />;
            case NotificationType.WARNING:
                return <Warning color="warning" />;
            case NotificationType.INFO:
            default:
                return <Info color="info" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case NotificationType.BUDGET_ALERT:
                return 'warning.light';
            case NotificationType.TRANSACTION:
                return 'primary.light';
            case NotificationType.SUCCESS:
                return 'success.light';
            case NotificationType.WARNING:
                return 'warning.light';
            case NotificationType.INFO:
            default:
                return 'info.light';
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            return formatDistanceToNow(new Date(timestamp), {
                addSuffix: true,
                locale: es
            });
        } catch (error) {
            return 'Hace un momento';
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    maxWidth: '100vw'
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <NotificationsActive sx={{ fontSize: 28 }} />
                            <Typography variant="h6" fontWeight={600}>
                                Notificaciones
                            </Typography>
                            {unreadCount > 0 && (
                                <Chip
                                    label={unreadCount}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        fontWeight: 700
                                    }}
                                />
                            )}
                        </Stack>
                        <IconButton onClick={onClose} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Alerta de permisos */}
                {permissionStatus === 'default' && (
                    <Alert severity="info" sx={{ m: 2 }}>
                        <AlertTitle>Activar Notificaciones del Navegador</AlertTitle>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Recibe alertas importantes incluso cuando no estés en la aplicación
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleRequestPermission}
                            sx={{ mt: 1 }}
                        >
                            Activar Notificaciones
                        </Button>
                    </Alert>
                )}

                {permissionStatus === 'denied' && (
                    <Alert severity="warning" sx={{ m: 2 }}>
                        <AlertTitle>Notificaciones Bloqueadas</AlertTitle>
                        <Typography variant="body2">
                            Has bloqueado las notificaciones. Puedes habilitarlas en la configuración de tu navegador.
                        </Typography>
                    </Alert>
                )}

                {/* Acciones */}
                {notifications.length > 0 && (
                    <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                startIcon={<DoneAll />}
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                Marcar todas
                            </Button>
                            <Button
                                size="small"
                                startIcon={<DeleteSweep />}
                                onClick={handleClearAll}
                                color="error"
                            >
                                Limpiar todo
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* Lista de notificaciones */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <NotificationsOff sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No hay notificaciones
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cuando tengas alertas importantes, aparecerán aquí
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {notifications.map((notification, index) => (
                                <Box key={notification.id}>
                                    <ListItem
                                        sx={{
                                            py: 2,
                                            bgcolor: notification.read ? 'transparent' : 'action.hover',
                                            borderLeft: notification.read ? 'none' : '4px solid',
                                            borderColor: getNotificationColor(notification.type),
                                            '&:hover': {
                                                bgcolor: 'action.selected'
                                            }
                                        }}
                                        secondaryAction={
                                            <Tooltip title="Descartar">
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleDismiss(notification.id)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={notification.read ? 400 : 600}
                                                    sx={{ pr: 1 }}
                                                >
                                                    {notification.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatTimestamp(notification.timestamp)}
                                                        </Typography>
                                                        {!notification.read && (
                                                            <Chip
                                                                label="Nuevo"
                                                                size="small"
                                                                color="primary"
                                                                sx={{ height: 18, fontSize: '0.65rem' }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </Stack>
                                            }
                                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                            sx={{ cursor: notification.read ? 'default' : 'pointer' }}
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};
