import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, IconButton, Box } from '@mui/material';
import { GetApp, Close } from '@mui/icons-material';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        // Escuchar el evento beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            // Prevenir que Chrome 67 y anteriores muestren automáticamente el prompt
            e.preventDefault();
            // Guardar el evento para poder usarlo después
            setDeferredPrompt(e);
            // Mostrar el botón de instalación
            setShowInstallPrompt(true);
        };

        // Escuchar cuando la app es instalada
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }

        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar a que el usuario responda al prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar la PWA');
        } else {
            console.log('Usuario rechazó instalar la PWA');
        }

        // Limpiar el prompt ya que solo se puede usar una vez
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleClose = () => {
        setShowInstallPrompt(false);
        // Guardar en localStorage que el usuario cerró el prompt
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // No mostrar si ya está instalada o si el usuario cerró el prompt anteriormente
    if (isInstalled || !showInstallPrompt || localStorage.getItem('pwa-install-dismissed')) {
        return null;
    }

    return (
        <Snackbar
            open={showInstallPrompt}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ bottom: { xs: 80, sm: 24 } }}
        >
            <Alert
                severity="info"
                variant="filled"
                action={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleInstallClick}
                            startIcon={<GetApp />}
                            sx={{
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                                }
                            }}
                        >
                            Instalar
                        </Button>
                        <IconButton
                            size="small"
                            aria-label="cerrar"
                            color="inherit"
                            onClick={handleClose}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                }
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    '& .MuiAlert-message': {
                        width: '100%'
                    }
                }}
            >
                <strong>¡Instala nuestra app!</strong>
                <br />
                Accede más rápido a tus finanzas desde tu dispositivo
            </Alert>
        </Snackbar>
    );
};
