import { NoteAdd, ArticleOutlined, EditNote } from "@mui/icons-material"
import { Grid, Typography, Box, Card, CardContent, Stack, CardActionArea, CircularProgress } from "@mui/material"

export const NothingSelectedView = ({ onCreateNote, isSaving = false }) => {
    return (
        <Grid
            className="animate__animated animate__fadeIn animate__faster"
            container
            spacing={ 0 }
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 100px)', md: 'calc(100vh - 110px)' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
                py: { xs: 3, sm: 4, md: 0 }
            }}>

            {/* Decorative circles */}
            <Box
                sx={{
                    position: 'absolute',
                    width: { xs: '200px', sm: '250px', md: '300px' },
                    height: { xs: '200px', sm: '250px', md: '300px' },
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: { xs: '-100px', sm: '-125px', md: '-150px' },
                    right: { xs: '-100px', sm: '-125px', md: '-150px' },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: { xs: '150px', sm: '175px', md: '200px' },
                    height: { xs: '150px', sm: '175px', md: '200px' },
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: { xs: '-75px', sm: '-85px', md: '-100px' },
                    left: { xs: '-75px', sm: '-85px', md: '-100px' },
                }}
            />

            {/* Main content */}
            <Grid item xs={ 12 } sx={{ zIndex: 1, textAlign: 'center', mb: { xs: 1, sm: 2 }, px: 2 }}>
                <Box
                    className="animate__animated animate__pulse animate__infinite animate__slow"
                    sx={{
                        display: 'inline-flex',
                        p: { xs: 2, sm: 2.5, md: 3 },
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        mb: { xs: 1, sm: 1.5, md: 2 }
                    }}
                >
                    <ArticleOutlined sx={{ fontSize: { xs: 50, sm: 65, md: 80 }, color: 'white' }}/>
                </Box>

                <Typography
                    color="white"
                    variant="h3"
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                        fontWeight: 700,
                        mb: { xs: 0.5, sm: 1 },
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        px: { xs: 2, sm: 0 }
                    }}
                >
                    Tu espacio de notas
                </Typography>

                <Typography
                    color="white"
                    variant="h6"
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                        fontWeight: 300,
                        opacity: 0.95,
                        mb: { xs: 3, sm: 3.5, md: 4 },
                        px: { xs: 3, sm: 2, md: 0 }
                    }}
                >
                    Organiza tus ideas y gastos en un solo lugar
                </Typography>
            </Grid>

            {/* Action cards */}
            <Grid item xs={ 12 } sx={{ zIndex: 1, width: '100%', maxWidth: { xs: '100%', sm: '600px', md: '700px' }, px: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 2, md: 3 }}
                    justifyContent="center"
                >
                    <Card
                        className="animate__animated animate__fadeInUp animate__delay-1s"
                        sx={{
                            background: isSaving
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            flex: 1,
                            transition: 'all 0.3s ease',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            '&:hover': isSaving ? {} : {
                                transform: { xs: 'scale(1.05)', sm: 'translateY(-10px)' },
                                background: 'rgba(255, 255, 255, 0.25)',
                                border: '2px solid rgba(255, 255, 255, 0.5)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                            },
                            '&:hover::before': isSaving ? {} : {
                                opacity: 1
                            }
                        }}
                    >
                        <CardActionArea
                            onClick={onCreateNote}
                            disabled={isSaving}
                            sx={{
                                height: '100%',
                                '&.Mui-disabled': {
                                    opacity: 0.6
                                }
                            }}
                        >
                            <CardContent sx={{
                                textAlign: 'center',
                                py: { xs: 3, sm: 4 },
                                px: { xs: 2, sm: 2.5 },
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {isSaving ? (
                                    <CircularProgress
                                        sx={{
                                            color: 'white',
                                            mb: { xs: 0.5, sm: 1 }
                                        }}
                                        size={50}
                                    />
                                ) : (
                                    <Box
                                        className="animate__animated animate__pulse animate__infinite animate__slow"
                                        sx={{
                                            display: 'inline-flex',
                                            p: 1.5,
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            mb: { xs: 0.5, sm: 1 }
                                        }}
                                    >
                                        <NoteAdd sx={{
                                            fontSize: { xs: 40, sm: 45, md: 50 },
                                            color: 'white'
                                        }}/>
                                    </Box>
                                )}
                                <Typography
                                    variant="h6"
                                    color="white"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 0.5,
                                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {isSaving ? 'Creando nota...' : 'Crear nota'}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                        fontWeight: 500
                                    }}
                                >
                                    {isSaving ? 'Por favor espera' : 'Haz clic aquí para comenzar'}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    <Card
                        className="animate__animated animate__fadeInUp animate__delay-1s"
                        sx={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            flex: 1,
                            transition: 'transform 0.3s ease, background 0.3s ease',
                            '&:hover': {
                                transform: { xs: 'scale(1.02)', sm: 'translateY(-5px)' },
                                background: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        <CardContent sx={{
                            textAlign: 'center',
                            py: { xs: 2.5, sm: 3 },
                            px: { xs: 2, sm: 2.5 }
                        }}>
                            <EditNote sx={{
                                fontSize: { xs: 40, sm: 45, md: 50 },
                                color: 'white',
                                mb: { xs: 0.5, sm: 1 }
                            }}/>
                            <Typography
                                variant="h6"
                                color="white"
                                sx={{
                                    fontWeight: 600,
                                    mb: 0.5,
                                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
                                }}
                            >
                                Seleccionar nota
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                Elige una nota del menú lateral
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Grid>

        </Grid>
    )
}
