import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogoutOutlined, AccountBalanceWallet, CalendarMonth, WbSunny, Brightness3, Receipt, StickyNote2, Palette, PictureAsPdf, Description, BarChart, Assessment } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography, Tooltip, Chip, Stack, alpha, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { startLogout } from "../../store/auth/thunks";
import { useThemeContext } from "../../context";
import { themeMetadata } from "../../theme/themes";
import { pdfService } from "../../services";
import { captureMultipleCharts, waitForChartsToRender } from "../../utils";

export const Navbar = ({ drawerWidth = 240 }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { displayName } = useSelector(state => state.auth);
    const { transactions } = useSelector(state => state.expenses);
    const { budgets } = useSelector(state => state.budgets);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { currentTheme, toggleTheme } = useThemeContext();
    const [pdfMenuAnchor, setPdfMenuAnchor] = useState(null);

    const isExpensesPage = location.pathname === '/expenses';
    const themeInfo = themeMetadata[currentTheme] || themeMetadata.light;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Actualiza cada minuto

        return () => clearInterval(timer);
    }, []);

    const onLogout = () => {
        dispatch(startLogout());
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return { text: 'Buenos días', icon: <WbSunny /> };
        if (hour < 19) return { text: 'Buenas tardes', icon: <WbSunny /> };
        return { text: 'Buenas noches', icon: <Brightness3 /> };
    };

    const greeting = getGreeting();

    // Funciones para generar PDFs
    const handleOpenPdfMenu = (event) => {
        setPdfMenuAnchor(event.currentTarget);
    };

    const handleClosePdfMenu = () => {
        setPdfMenuAnchor(null);
    };

    const handleDownloadTransactionsReport = () => {
        pdfService.generateTransactionsReport(transactions);
        handleClosePdfMenu();
    };

    const handleDownloadStatisticsReport = async () => {
        try {
            await waitForChartsToRender();
            const chartIds = ['expenses-by-category-chart', 'income-vs-expenses-chart'];
            const chartImages = await captureMultipleCharts(chartIds);
            pdfService.generateStatisticsReport(transactions, chartImages);
            handleClosePdfMenu();
        } catch (error) {
            console.error('Error al generar reporte:', error);
            pdfService.generateStatisticsReport(transactions);
            handleClosePdfMenu();
        }
    };

    const handleDownloadBudgetsReport = () => {
        pdfService.generateBudgetsReport(budgets, transactions);
        handleClosePdfMenu();
    };

    const handleDownloadMonthlyReport = async () => {
        try {
            const currentDate = new Date();
            await waitForChartsToRender();
            const chartIds = ['monthly-trend-chart', 'expenses-by-category-chart', 'income-vs-expenses-chart'];
            const chartImages = await captureMultipleCharts(chartIds);
            pdfService.generateMonthlyReport(
                transactions,
                budgets,
                currentDate.getMonth(),
                currentDate.getFullYear(),
                chartImages
            );
            handleClosePdfMenu();
        } catch (error) {
            console.error('Error al generar reporte mensual:', error);
            const currentDate = new Date();
            pdfService.generateMonthlyReport(
                transactions,
                budgets,
                currentDate.getMonth(),
                currentDate.getFullYear()
            );
            handleClosePdfMenu();
        }
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Toolbar sx={{ py: { xs: 0.5, sm: 1 } }}>
                {/* Logo y título */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'rotate(10deg) scale(1.05)'
                            }
                        }}
                    >
                        <AccountBalanceWallet sx={{ color: 'white', fontSize: 24 }} />
                    </Box>

                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            Control de Gastos
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.7rem',
                                display: 'block',
                                lineHeight: 1
                            }}
                        >
                            Gestiona tus finanzas personales
                        </Typography>
                    </Box>

                    {/* Título corto para móvil */}
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        Control de Gastos
                    </Typography>
                </Box>

                {/* Información central */}
                <Stack
                    direction="row"
                    spacing={{ xs: 1, sm: 1.5 }}
                    alignItems="center"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                    {/* Chip de saludo - Ahora es un botón para cambiar el tema */}
                    <Tooltip
                        title={`Tema actual: ${themeInfo.name} - Click para cambiar`}
                        arrow
                    >
                        <Chip
                            icon={<span style={{ fontSize: 18 }}>{themeInfo.icon}</span>}
                            label={
                                <Box>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                        {greeting.text}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                        {displayName?.split(' ')[0] || 'Usuario'}
                                    </Typography>
                                </Box>
                            }
                            onClick={toggleTheme}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                fontWeight: 500,
                                height: 'auto',
                                py: 0.5,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                },
                                '& .MuiChip-icon': {
                                    color: 'white',
                                    fontSize: 18
                                }
                            }}
                        />
                    </Tooltip>

                    {/* Chip de fecha */}
                    <Tooltip title={formatDate()} arrow>
                        <Chip
                            icon={<CalendarMonth sx={{ fontSize: 18 }} />}
                            label={currentTime.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short'
                            })}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                fontWeight: 600,
                                display: { xs: 'none', md: 'flex' },
                                '& .MuiChip-icon': {
                                    color: 'white'
                                }
                            }}
                        />
                    </Tooltip>
                </Stack>

                {/* Botón de descarga PDF */}
                <Tooltip title="Descargar Reporte PDF" arrow>
                    <IconButton
                        onClick={handleOpenPdfMenu}
                        sx={{
                            ml: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }
                        }}
                    >
                        <PictureAsPdf />
                    </IconButton>
                </Tooltip>

                {/* Menú de PDFs */}
                <Menu
                    anchorEl={pdfMenuAnchor}
                    open={Boolean(pdfMenuAnchor)}
                    onClose={handleClosePdfMenu}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            mt: 1,
                            minWidth: 280
                        }
                    }}
                >
                    <MenuItem onClick={handleDownloadTransactionsReport}>
                        <ListItemIcon>
                            <Description fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Reporte de Transacciones"
                            secondary="Lista detallada de transacciones"
                        />
                    </MenuItem>
                    <MenuItem onClick={handleDownloadStatisticsReport}>
                        <ListItemIcon>
                            <BarChart fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Resumen de Estadísticas"
                            secondary="Análisis por categoría"
                        />
                    </MenuItem>
                    <MenuItem onClick={handleDownloadBudgetsReport}>
                        <ListItemIcon>
                            <Assessment fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Reporte de Presupuestos"
                            secondary="Estado actual de presupuestos"
                        />
                    </MenuItem>
                    <MenuItem onClick={handleDownloadMonthlyReport}>
                        <ListItemIcon>
                            <CalendarMonth fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Reporte Mensual Completo"
                            secondary="Reporte completo del mes actual"
                        />
                    </MenuItem>
                </Menu>

                {/* Botones de navegación */}
                <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                    <Tooltip title="Notas" arrow>
                        <Button
                            onClick={() => navigate('/')}
                            variant={!isExpensesPage ? "contained" : "outlined"}
                            size="small"
                            startIcon={<StickyNote2 />}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                bgcolor: !isExpensesPage ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.4)',
                                    borderColor: 'rgba(255, 255, 255, 0.5)'
                                },
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            Notas
                        </Button>
                    </Tooltip>
                    <Tooltip title="Gastos" arrow>
                        <Button
                            onClick={() => navigate('/expenses')}
                            variant={isExpensesPage ? "contained" : "outlined"}
                            size="small"
                            startIcon={<Receipt />}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                bgcolor: isExpensesPage ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.4)',
                                    borderColor: 'rgba(255, 255, 255, 0.5)'
                                },
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            Gastos
                        </Button>
                    </Tooltip>

                    {/* Versión móvil - Solo iconos */}
                    <Tooltip title="Notas" arrow>
                        <IconButton
                            onClick={() => navigate('/')}
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                color: 'white',
                                bgcolor: !isExpensesPage ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.4)'
                                }
                            }}
                        >
                            <StickyNote2 />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Gastos" arrow>
                        <IconButton
                            onClick={() => navigate('/expenses')}
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                color: 'white',
                                bgcolor: isExpensesPage ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.4)'
                                }
                            }}
                        >
                            <Receipt />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* Botón de logout */}
                <Tooltip title="Cerrar sesión" arrow>
                    <IconButton
                        onClick={onLogout}
                        sx={{
                            ml: { xs: 1, sm: 2 },
                            bgcolor: 'rgba(244, 67, 54, 0.2)',
                            color: 'white',
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: 'error.main',
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                            }
                        }}
                    >
                        <LogoutOutlined />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
};
