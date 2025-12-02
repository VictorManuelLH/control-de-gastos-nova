/**
 * Servicio de notificaciones PWA
 * Maneja notificaciones del navegador y notificaciones in-app
 */

const NOTIFICATION_STORAGE_KEY = 'pwa_notifications';
const MAX_NOTIFICATIONS = 50;

export const NotificationType = {
    BUDGET_ALERT: 'budget_alert',
    TRANSACTION: 'transaction',
    SUMMARY: 'summary',
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success'
};

class PWANotificationService {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.loadNotifications();
    }

    /**
     * Solicita permisos para notificaciones del navegador
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Este navegador no soporta notificaciones');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission;
        }

        return Notification.permission;
    }

    /**
     * Verifica si las notificaciones están permitidas
     */
    isPermissionGranted() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * Envía una notificación del navegador
     */
    async sendBrowserNotification(title, options = {}) {
        const permission = await this.requestPermission();

        if (permission !== 'granted') {
            console.warn('Permisos de notificación denegados');
            return null;
        }

        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
            requireInteraction: false,
            ...options
        });

        // Auto-cerrar después de 5 segundos si no requiere interacción
        if (!options.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        return notification;
    }

    /**
     * Crea una notificación in-app
     */
    createNotification({
        type = NotificationType.INFO,
        title,
        message,
        category = null,
        amount = null,
        data = {},
        showBrowser = true,
        sound = true
    }) {
        const notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            category,
            amount,
            data,
            timestamp: Date.now(),
            read: false,
            dismissed: false
        };

        // Agregar al array de notificaciones
        this.notifications.unshift(notification);

        // Limitar el número de notificaciones almacenadas
        if (this.notifications.length > MAX_NOTIFICATIONS) {
            this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
        }

        // Guardar en localStorage
        this.saveNotifications();

        // Notificar a los listeners
        this.notifyListeners();

        // Enviar notificación del navegador si está habilitado
        if (showBrowser && this.isPermissionGranted()) {
            this.sendBrowserNotification(title, {
                body: message,
                tag: notification.id,
                data: notification
            });
        }

        // Reproducir sonido si está habilitado
        if (sound) {
            this.playNotificationSound();
        }

        return notification;
    }

    /**
     * Reproduce sonido de notificación
     */
    playNotificationSound() {
        try {
            // Crear un AudioContext para generar un sonido simple
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('No se pudo reproducir el sonido de notificación:', error);
        }
    }

    /**
     * Notificación de alerta de presupuesto
     */
    notifyBudgetAlert({ category, budget, spent, percentage, remaining }) {
        let emoji = '⚠️';
        let level = 'ADVERTENCIA';

        if (percentage >= 100) {
            emoji = '🚨';
            level = 'EXCEDIDO';
        } else if (percentage >= 90) {
            emoji = '🔴';
            level = 'CRÍTICO';
        }

        const message = `${category}: ${percentage.toFixed(1)}% del presupuesto usado`;

        return this.createNotification({
            type: NotificationType.BUDGET_ALERT,
            title: `${emoji} Alerta de Presupuesto`,
            message,
            category,
            amount: spent,
            data: { budget, spent, percentage, remaining, level },
            showBrowser: true,
            sound: percentage >= 90
        });
    }

    /**
     * Notificación de transacción
     */
    notifyTransaction({ type, amount, category, description }) {
        const emoji = type === 'expense' ? '💸' : '💰';
        const typeText = type === 'expense' ? 'Gasto' : 'Ingreso';

        return this.createNotification({
            type: NotificationType.TRANSACTION,
            title: `${emoji} ${typeText} Registrado`,
            message: `${category}: $${amount.toFixed(2)}${description ? ` - ${description}` : ''}`,
            category,
            amount,
            data: { transactionType: type, description },
            showBrowser: false, // No mostrar en navegador para no saturar
            sound: false
        });
    }

    /**
     * Notificación de resumen enviado
     */
    notifySummarySent(summaryType) {
        const types = {
            daily: { emoji: '📊', text: 'Resumen Diario' },
            weekly: { emoji: '📈', text: 'Resumen Semanal' },
            monthly: { emoji: '📆', text: 'Resumen Mensual' }
        };

        const { emoji, text } = types[summaryType] || types.daily;

        return this.createNotification({
            type: NotificationType.SUCCESS,
            title: `${emoji} ${text} Enviado`,
            message: 'Tu resumen ha sido enviado a Telegram exitosamente',
            data: { summaryType },
            showBrowser: false,
            sound: false
        });
    }

    /**
     * Notificación de información general
     */
    notifyInfo(title, message, data = {}) {
        return this.createNotification({
            type: NotificationType.INFO,
            title,
            message,
            data,
            showBrowser: false,
            sound: false
        });
    }

    /**
     * Notificación de éxito
     */
    notifySuccess(title, message, data = {}) {
        return this.createNotification({
            type: NotificationType.SUCCESS,
            title,
            message,
            data,
            showBrowser: false,
            sound: false
        });
    }

    /**
     * Notificación de advertencia
     */
    notifyWarning(title, message, data = {}) {
        return this.createNotification({
            type: NotificationType.WARNING,
            title,
            message,
            data,
            showBrowser: true,
            sound: true
        });
    }

    /**
     * Obtiene todas las notificaciones
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * Obtiene notificaciones no leídas
     */
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read && !n.dismissed);
    }

    /**
     * Obtiene el contador de notificaciones no leídas
     */
    getUnreadCount() {
        return this.getUnreadNotifications().length;
    }

    /**
     * Marca una notificación como leída
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.notifyListeners();
        }
    }

    /**
     * Marca todas las notificaciones como leídas
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.notifyListeners();
    }

    /**
     * Descarta (elimina) una notificación
     */
    dismissNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.notifyListeners();
        }
    }

    /**
     * Limpia todas las notificaciones
     */
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
        this.notifyListeners();
    }

    /**
     * Limpia notificaciones antiguas (más de 30 días)
     */
    clearOldNotifications() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.notifications = this.notifications.filter(n => n.timestamp > thirtyDaysAgo);
        this.saveNotifications();
        this.notifyListeners();
    }

    /**
     * Guarda notificaciones en localStorage
     */
    saveNotifications() {
        try {
            localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error al guardar notificaciones:', error);
        }
    }

    /**
     * Carga notificaciones desde localStorage
     */
    loadNotifications() {
        try {
            const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
            if (stored) {
                this.notifications = JSON.parse(stored);
                // Limpiar notificaciones antiguas al cargar
                this.clearOldNotifications();
            }
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
            this.notifications = [];
        }
    }

    /**
     * Suscribe un listener para cambios en notificaciones
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notifica a todos los listeners
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.notifications, this.getUnreadCount());
            } catch (error) {
                console.error('Error al notificar listener:', error);
            }
        });
    }

    /**
     * Obtiene el estado de permisos
     */
    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'not-supported';
        }
        return Notification.permission;
    }
}

// Exportar instancia única
export const pwaNotificationService = new PWANotificationService();
