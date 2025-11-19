import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutline, QuestionAnswerOutlined, SaveOutlined, UploadOutlined, EmojiSymbols, NoteAdd } from "@mui/icons-material";
import { Button, Grid, IconButton, TextField, Typography, Box, Paper, Stack, Chip, Tooltip, Divider } from "@mui/material";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.js';
import { ImageGallery, DrawerPreguntas, DrawerSymbols } from "../components";
import { useForm } from "../../hooks/useForm";
import { setActiveNote, startCleanConversation, startDeletingNote, startQuestion, startSaveNote, startUploadFiles, startNewNote } from "../../store/journal";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarToday, Title, Description } from '@mui/icons-material';

export const NoteView = () => {
    const dispatch = useDispatch();
    const { active: note, messageSaved, isSaving, openAIResponse } = useSelector(state => state.journal);
    const { body, title, date, onInputChange, formState } = useForm(note);
    const dateString = useMemo(() => format(new Date(date), 'dd MMMM yyyy, h:mm a', { locale: es }), [date]);
    const fileInputRef = useRef();

    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isSymbolDrawerOpen, setSymbolDrawerOpen] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [conversation, setConversation] = useState(note?.conversation || []);

    useEffect(() => {
        dispatch(setActiveNote(formState));
        if (messageSaved.length > 0) {
            Swal.fire('Nota actualizada', messageSaved, 'success');
        }
    }, [formState, messageSaved, dispatch]);

    useEffect(() => {
        if (openAIResponse) {
            const updatedConversation = [...conversation, { role: 'assistant', content: openAIResponse }];
            setConversation(updatedConversation);
            dispatch(setActiveNote({
                ...note,
                conversation: updatedConversation
            }));
        }
    }, [openAIResponse]);

    useEffect(() => {
        if (note) {
            setConversation(note.conversation || []);
        }
    }, [note]);

    useEffect(() => {
        if (note) {
            localStorage.setItem('activeNote', JSON.stringify(note));
        }
    }, [note]);

    const onSaveNote = () => {
        dispatch(startSaveNote());
    };

    const onOpenDrawer = () => setDrawerOpen(true);
    const onCloseDrawer = () => setDrawerOpen(false);
    const onOpenSymbolDrawer = () => setSymbolDrawerOpen(true);
    const onCloseSymbolDrawer = () => setSymbolDrawerOpen(false);

    const onFileInputChange = ({ target }) => {
        if (target.files.length === 0) return;
        dispatch(startUploadFiles(target.files));
    };

    const onInputQuestion = () => {
        if (questionText.trim().length === 0) return;

        const updatedConversation = [...conversation, { role: 'user', content: questionText }];
        setConversation(updatedConversation);

        const updatedNote = {
            ...note,
            conversation: updatedConversation
        };

        dispatch(setActiveNote(updatedNote));
        dispatch(startQuestion(questionText));

        setQuestionText('');
    };

    const onDelete = () => {
        dispatch(startDeletingNote());
    };

    const onCreateNewNote = () => {
        dispatch(startNewNote());
    };

    const handleImageDelete = (image) => {
        const updatedImages = note.imageUrls.filter(img => img !== image);
        dispatch(setActiveNote({ ...note, imageUrls: updatedImages }));
    };

    const onClearConversation = () => {
        dispatch(startCleanConversation());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const cursorPosition = e.target.selectionStart;
            const beforeCursor = body.slice(0, cursorPosition);
            const afterCursor = body.slice(cursorPosition);
            const newBody = `${beforeCursor}\n\t${afterCursor}`;

            onInputChange({ target: { name: 'body', value: newBody } });
        }
    };

    return (
        <Box className="animate__animated animate__fadeIn animate__faster" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header con gradiente */}
            <Paper
                elevation={0}
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    mb: 3,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                    {/* Fecha */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
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
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            <CalendarToday sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                fontWeight: 600,
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            {dateString}
                        </Typography>
                    </Stack>

                    {/* Botones de acción */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={onFileInputChange}
                            style={{ display: 'none' }}
                        />

                        <Tooltip title="Guardar nota" arrow>
                            <Button
                                disabled={isSaving}
                                onClick={onSaveNote}
                                variant="contained"
                                startIcon={<SaveOutlined />}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    fontWeight: 600,
                                    flex: { xs: 1, sm: 'unset' },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Guardar
                            </Button>
                        </Tooltip>

                        <Tooltip title="Subir imágenes" arrow>
                            <Button
                                disabled={isSaving}
                                onClick={() => fileInputRef.current.click()}
                                variant="contained"
                                startIcon={<UploadOutlined />}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    fontWeight: 600,
                                    flex: { xs: 1, sm: 'unset' },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Subir
                            </Button>
                        </Tooltip>

                        <Tooltip title="Preguntar a IA" arrow>
                            <Button
                                disabled={isSaving}
                                onClick={onOpenDrawer}
                                variant="contained"
                                startIcon={<QuestionAnswerOutlined />}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    fontWeight: 600,
                                    flex: { xs: 1, sm: 'unset' },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Preguntar
                            </Button>
                        </Tooltip>

                        <Tooltip title="Insertar símbolos" arrow>
                            <IconButton
                                disabled={isSaving}
                                onClick={onOpenSymbolDrawer}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <EmojiSymbols />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Crear nueva nota" arrow>
                            <Button
                                disabled={isSaving}
                                onClick={onCreateNewNote}
                                variant="contained"
                                startIcon={<NoteAdd />}
                                sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(76, 175, 80, 0.5)',
                                    color: 'white',
                                    fontWeight: 700,
                                    flex: { xs: 1, sm: 'unset' },
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                                    '&:hover': {
                                        bgcolor: 'success.main',
                                        transform: 'translateY(-3px) scale(1.02)',
                                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                        border: '2px solid rgba(76, 175, 80, 0.8)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        border: '2px solid rgba(255, 255, 255, 0.2)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Nueva
                            </Button>
                        </Tooltip>

                        <Tooltip title="Eliminar nota" arrow>
                            <Button
                                onClick={onDelete}
                                variant="contained"
                                startIcon={<DeleteOutline />}
                                sx={{
                                    bgcolor: 'rgba(244, 67, 54, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(244, 67, 54, 0.5)',
                                    color: 'white',
                                    fontWeight: 600,
                                    ml: { xs: 0, sm: 'auto' },
                                    flex: { xs: 1, sm: 'unset' },
                                    '&:hover': {
                                        bgcolor: 'error.main',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Borrar
                            </Button>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        top: '-50px',
                        right: '-50px',
                        zIndex: 0
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        bottom: '-30px',
                        left: '-30px',
                        zIndex: 0
                    }}
                />
            </Paper>

            {/* Contenido principal */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Título */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 0,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        }
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.5,
                            bgcolor: 'action.hover'
                        }}
                    >
                        <Title sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                            Título de la nota
                        </Typography>
                    </Box>
                    <TextField
                        type="text"
                        variant="standard"
                        fullWidth
                        placeholder="Escribe un título descriptivo..."
                        name="title"
                        value={title}
                        onChange={onInputChange}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                px: 2,
                                py: 1.5,
                                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                                fontWeight: 600,
                                color: 'text.primary'
                            }
                        }}
                    />
                </Paper>

                {/* Cuerpo */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        p: 0,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                        }
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.5,
                            bgcolor: 'action.hover'
                        }}
                    >
                        <Description sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                            Contenido
                        </Typography>
                    </Box>
                    <TextField
                        type="text"
                        variant="standard"
                        fullWidth
                        multiline
                        placeholder="¿Qué sucedió hoy? Escribe tus pensamientos..."
                        minRows={8}
                        name="body"
                        value={body}
                        onChange={onInputChange}
                        onKeyDown={handleKeyDown}
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                px: 2,
                                py: 1.5,
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                color: 'text.primary',
                                lineHeight: 1.8,
                                flex: 1,
                                alignItems: 'flex-start'
                            }
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiInputBase-root': {
                                height: '100%',
                                alignItems: 'flex-start'
                            }
                        }}
                    />
                </Paper>

                {/* Galería de imágenes */}
                {note.imageUrls && note.imageUrls.length > 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={2}>
                            Imágenes adjuntas ({note.imageUrls.length})
                        </Typography>
                        <ImageGallery images={note.imageUrls} onImageDelete={handleImageDelete} />
                    </Paper>
                )}
            </Box>

            {/* Drawer para Preguntas */}
            <DrawerPreguntas
                isDrawerOpen={isDrawerOpen}
                onCloseDrawer={onCloseDrawer}
                questionText={questionText}
                setQuestionText={setQuestionText}
                onInputQuestion={onInputQuestion}
                conversation={conversation}
                onClearConversation={onClearConversation}
            />

            {/* Drawer para Símbolos */}
            <DrawerSymbols
                isSymbolDrawerOpen={isSymbolDrawerOpen}
                onCloseSymbolDrawer={onCloseSymbolDrawer}
            />
        </Box>
    );
};
