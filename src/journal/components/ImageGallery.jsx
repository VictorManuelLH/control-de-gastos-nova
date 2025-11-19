import { useState } from 'react';
import {
    ImageList,
    ImageListItem,
    Dialog,
    IconButton,
    Button,
    useMediaQuery,
    Box,
    Typography,
    Fade,
    Backdrop,
    Stack,
    Chip,
    Tooltip,
    Zoom
} from "@mui/material";
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    NavigateBefore,
    NavigateNext,
    ZoomIn,
    Download
} from "@mui/icons-material";

export const ImageGallery = ({ images, onImageDelete }) => {
    const [open, setOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');
    const selectedImage = images[selectedImageIndex];

    const handleClickOpen = (image) => {
        const index = images.indexOf(image);
        setSelectedImageIndex(index);
        setImageLoaded(false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImageLoaded(false);
    };

    const handleDelete = () => {
        onImageDelete(selectedImage);
        handleClose();
    };

    const handlePrevious = () => {
        setImageLoaded(false);
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setImageLoaded(false);
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleDownload = () => {
        window.open(selectedImage, '_blank');
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <>
            {/* Galería de miniaturas */}
            <ImageList
                sx={{
                    width: '100%',
                    height: isMobile ? 'auto' : 900,
                    gap: isMobile ? 8 : 12,
                }}
                cols={isMobile ? 2 : 3}
                rowHeight={isMobile ? 120 : 164}
            >
                {images.map((image, index) => (
                    <ImageListItem
                        key={image}
                        sx={{
                            overflow: 'hidden',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                borderColor: 'primary.main',
                                zIndex: 1
                            }
                        }}
                    >
                        <img
                            src={`${image}?w=${isMobile ? 120 : 164}&h=${isMobile ? 120 : 164}&fit=crop&auto=format`}
                            srcSet={`${image}?w=${isMobile ? 120 : 164}&h=${isMobile ? 120 : 164}&fit=crop&auto=format&dpr=2 2x`}
                            alt={`Imagen ${index + 1} de la nota`}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onClick={() => handleClickOpen(image)}
                        />
                        {/* Overlay con número de imagen */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(8px)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}
                        >
                            <ZoomIn sx={{ fontSize: 14 }} />
                            {index + 1}
                        </Box>
                    </ImageListItem>
                ))}
            </ImageList>

            {/* Modal mejorado */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 400 }}
                PaperProps={{
                    sx: {
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'visible',
                        m: { xs: 1, sm: 2, md: 4 }
                    }
                }}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.9)',
                        backdropFilter: 'blur(8px)'
                    }
                }}
            >
                {/* Contenedor principal */}
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '50vh', sm: '70vh' },
                        p: { xs: 2, sm: 4 }
                    }}
                >
                    {/* Header con controles superiores */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: { xs: 8, sm: 16 },
                            left: { xs: 8, sm: 16 },
                            right: { xs: 8, sm: 16 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 2,
                            gap: 2
                        }}
                    >
                        {/* Contador de imágenes */}
                        <Zoom in={open}>
                            <Chip
                                label={`${selectedImageIndex + 1} / ${images.length}`}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    height: 40,
                                    px: 1,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        </Zoom>

                        {/* Botones de acción */}
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Descargar imagen" arrow>
                                <IconButton
                                    onClick={handleDownload}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        color: 'primary.main',
                                        width: 48,
                                        height: 48,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'white',
                                            transform: 'scale(1.1)',
                                            color: 'primary.dark'
                                        }
                                    }}
                                >
                                    <Download />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Cerrar" arrow>
                                <IconButton
                                    onClick={handleClose}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        color: 'text.primary',
                                        width: 48,
                                        height: 48,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            transform: 'scale(1.1) rotate(90deg)'
                                        }
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    {/* Contenedor de la imagen */}
                    <Zoom in={imageLoaded} timeout={300}>
                        <Box
                            sx={{
                                position: 'relative',
                                maxWidth: '100%',
                                maxHeight: { xs: '60vh', sm: '75vh' },
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                border: '3px solid',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                bgcolor: 'background.paper'
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt={`Imagen ${selectedImageIndex + 1}`}
                                onLoad={handleImageLoad}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />
                        </Box>
                    </Zoom>

                    {/* Botones de navegación */}
                    {images.length > 1 && (
                        <>
                            {/* Botón Anterior */}
                            <Tooltip title="Imagen anterior" arrow>
                                <IconButton
                                    onClick={handlePrevious}
                                    sx={{
                                        position: 'absolute',
                                        left: { xs: 8, sm: 16 },
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        width: { xs: 48, sm: 56 },
                                        height: { xs: 48, sm: 56 },
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'white',
                                            transform: 'translateY(-50%) scale(1.15)',
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    <NavigateBefore sx={{ fontSize: { xs: 28, sm: 32 } }} />
                                </IconButton>
                            </Tooltip>

                            {/* Botón Siguiente */}
                            <Tooltip title="Imagen siguiente" arrow>
                                <IconButton
                                    onClick={handleNext}
                                    sx={{
                                        position: 'absolute',
                                        right: { xs: 8, sm: 16 },
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        width: { xs: 48, sm: 56 },
                                        height: { xs: 48, sm: 56 },
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: 'white',
                                            transform: 'translateY(-50%) scale(1.15)',
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    <NavigateNext sx={{ fontSize: { xs: 28, sm: 32 } }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    {/* Footer con botón de eliminar */}
                    <Zoom in={open} style={{ transitionDelay: '200ms' }}>
                        <Button
                            onClick={handleDelete}
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            sx={{
                                position: 'absolute',
                                bottom: { xs: 16, sm: 24 },
                                bgcolor: 'rgba(244, 67, 54, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontWeight: 600,
                                px: 3,
                                py: 1.5,
                                borderRadius: 3,
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'error.dark',
                                    transform: 'translateY(-4px) scale(1.05)',
                                    boxShadow: '0 8px 24px rgba(244, 67, 54, 0.6)'
                                }
                            }}
                        >
                            Eliminar Imagen
                        </Button>
                    </Zoom>
                </Box>
            </Dialog>
        </>
    );
};
