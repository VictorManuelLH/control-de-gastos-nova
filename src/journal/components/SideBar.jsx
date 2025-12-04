import { useState, useMemo } from "react";
import { Drawer, Box, Toolbar, Typography, Divider, List, IconButton, Avatar, Stack, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AccountCircle, StickyNote2 } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { SideBarItem } from "./";

export const SideBar = ({ drawerWidth = 240 }) => {
    const { displayName } = useSelector(state => state.auth);
    const { notes } = useSelector(state => state.journal);

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };


    // Ordenar notas: primero las fijadas, luego por fecha (más recientes primero)
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => {
            // Primero ordenar por estado de fijado
            if (b.isPinned !== a.isPinned) {
                return b.isPinned ? 1 : -1;
            }
            // Si ambas están fijadas o ambas no lo están, ordenar por fecha
            return b.date - a.date;
        });
    }, [notes]);

    const drawerContent = (
        <>
            {/* Header con gradiente */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 3,
                    px: 2,
                    color: 'white'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar
                        sx={{
                            width: 50,
                            height: 50,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <AccountCircle sx={{ fontSize: 35 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            {displayName}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.9,
                                fontSize: '0.75rem'
                            }}
                        >
                            Control de Gastos
                        </Typography>
                    </Box>
                </Stack>

                {/* Contador de notas */}
                <Chip
                    icon={<StickyNote2 sx={{ fontSize: 18, color: 'white !important' }} />}
                    label={`${notes.length} ${notes.length === 1 ? 'nota' : 'notas'}`}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '& .MuiChip-icon': {
                            color: 'white'
                        }
                    }}
                />
            </Box>

            <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

            {/* Lista de notas */}
            <Box sx={{ overflow: 'auto', flex: 1 }}>
                {sortedNotes.length > 0 ? (
                    <List sx={{ pt: 1, pb: 1 }}>
                        {sortedNotes.map(note => (
                            <SideBarItem
                                key={note.id}
                                {...note}
                                onCloseSidebar={() => setMobileOpen(false)}
                            />
                        ))}
                    </List>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 4,
                            px: 2,
                            textAlign: 'center'
                        }}
                    >
                        <StickyNote2
                            sx={{
                                fontSize: 60,
                                color: 'grey.300',
                                mb: 2
                            }}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.875rem' }}
                        >
                            No hay notas aún
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Crea tu primera nota
                        </Typography>
                    </Box>
                )}
            </Box>
        </>
    );

    return (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    position: 'fixed',
                    top: 64,
                    left: 16,
                    zIndex: 1300,
                    bgcolor: 'rgba(102, 126, 234, 0.95)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    backdropFilter: 'blur(10px)',
                    width: 56,
                    height: 56,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                        bgcolor: 'rgba(118, 75, 162, 0.95)',
                        transform: 'scale(1.05) rotate(90deg)',
                        boxShadow: '0 6px 16px rgba(118, 75, 162, 0.4)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>

            {/* Drawer para pantallas grandes */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Drawer desplegable para móviles */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: '85vw',
                        maxWidth: 320,
                        borderRight: 'none',
                        boxShadow: '8px 0 24px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(102, 126, 234, 0.15)',
                        backdropFilter: 'blur(4px)'
                    }
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};
