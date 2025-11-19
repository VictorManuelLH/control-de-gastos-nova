import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListItem, ListItemButton, ListItemIcon, Grid, ListItemText, IconButton, Box, Typography, Chip } from "@mui/material";
import { TurnedInNot, TurnedIn, DescriptionOutlined, CalendarToday } from "@mui/icons-material";
import { setActiveNote } from "../../store/journal/journalSlice";
import { togglePinNoteFirebase } from "../../store/journal/thunks";
import { TEXT_LIMITS } from "../../constants";

/**
 * Trunca un texto a un límite especificado
 * @param {string} text - Texto a truncar
 * @param {number} limit - Límite de caracteres
 * @returns {string} Texto truncado con "..." o texto original
 */
const truncateText = (text, limit) => {
    if (!text) return '';
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

/**
 * Formatea una fecha a formato corto
 * @param {number} timestamp - Timestamp de la fecha
 * @returns {string} Fecha formateada
 */
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }
};

/**
 * Componente para mostrar un item de nota en el sidebar
 */
export const SideBarItem = ({
    title,
    body,
    id,
    date,
    imageUrls = [],
    isPinned,
    conversation = [],
    onCloseSidebar
}) => {
    const dispatch = useDispatch();
    const { active } = useSelector(state => state.journal);
    const isActive = active?.id === id;

    /**
     * Activa la nota actual
     */
    const handleActiveNote = () => {
        dispatch(setActiveNote({
            title,
            body,
            id,
            date,
            imageUrls,
            conversation,
            isPinned
        }));

        if (onCloseSidebar) {
            onCloseSidebar();
        }
    };

    /**
     * Alterna el estado de fijado de la nota
     */
    const handleTogglePin = (event) => {
        event.stopPropagation();
        dispatch(togglePinNoteFirebase(id, isPinned));
    };

    const truncatedTitle = useMemo(
        () => truncateText(title, TEXT_LIMITS.TITLE_PREVIEW),
        [title]
    );

    const truncatedBody = useMemo(
        () => truncateText(body, TEXT_LIMITS.BODY_PREVIEW),
        [body]
    );

    return (
        <ListItem
            disablePadding
            sx={{
                mb: 0.5,
                px: 1
            }}
        >
            <ListItemButton
                onClick={handleActiveNote}
                sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'inherit',
                    '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'action.hover',
                        transform: 'translateX(4px)',
                        boxShadow: isActive ? 2 : 1,
                    },
                    boxShadow: isActive ? 1 : 0,
                    py: 1.5,
                    px: 1.5
                }}
            >
                {/* Icono de fijado */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mr: 1,
                        minWidth: 'auto'
                    }}
                >
                    <IconButton
                        onClick={handleTogglePin}
                        aria-label="Fijar nota"
                        size="small"
                        sx={{
                            padding: 0.5,
                            color: isPinned
                                ? (isActive ? '#FFD700' : 'warning.main')
                                : (isActive ? 'rgba(255, 255, 255, 0.7)' : 'action.disabled'),
                            '&:hover': {
                                color: isPinned
                                    ? (isActive ? '#FFC700' : 'warning.dark')
                                    : (isActive ? 'rgba(255, 255, 255, 0.9)' : 'action.active'),
                                bgcolor: 'transparent'
                            }
                        }}
                    >
                        {isPinned ? <TurnedIn /> : <TurnedInNot />}
                    </IconButton>
                </Box>

                {/* Contenido de la nota */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Título y fecha */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                        <DescriptionOutlined
                            sx={{
                                fontSize: 16,
                                color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'action.active',
                                flexShrink: 0
                            }}
                        />
                        <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                flex: 1,
                                minWidth: 0,
                                color: isActive ? 'white' : 'text.primary'
                            }}
                        >
                            {truncatedTitle || 'Sin título'}
                        </Typography>
                    </Box>

                    {/* Cuerpo de la nota */}
                    {truncatedBody && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.75rem',
                                color: isActive ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                mb: 0.5,
                                lineHeight: 1.3
                            }}
                        >
                            {truncatedBody}
                        </Typography>
                    )}

                    {/* Fecha */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday
                            sx={{
                                fontSize: 11,
                                color: isActive ? 'rgba(255, 255, 255, 0.6)' : 'text.disabled'
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.7rem',
                                color: isActive ? 'rgba(255, 255, 255, 0.7)' : 'text.disabled',
                                fontWeight: 500
                            }}
                        >
                            {formatDate(date)}
                        </Typography>

                        {/* Badge de fijado */}
                        {isPinned && (
                            <Chip
                                label="Fijada"
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: '0.625rem',
                                    ml: 'auto',
                                    bgcolor: isActive ? 'rgba(255, 215, 0, 0.2)' : 'warning.light',
                                    color: isActive ? '#FFD700' : 'warning.dark',
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                        px: 1
                                    }
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </ListItemButton>
        </ListItem>
    );
};
