import { Google } from "@mui/icons-material"
import { Alert, Button, Grid, Link, TextField, Typography, Box } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { AuthLayout } from "../layout/AuthLayout"
import { useForm } from "../../hooks"
import { checkingAuthentication, startGoogleSingIn, startLoginWithEmailAndPassword } from "../../store/auth/thunks"
import { useDispatch, useSelector } from "react-redux"
import { useMemo } from "react"

const formData = {
    email: '',
    password: ''
}

export const LoginPage = () => {
    const { status, errorMessage } = useSelector( state => state.auth )
    const dispatch = useDispatch()

    const { email, password, onInputChange, formState, isFormValid } = useForm( formData )

    const isAuthenticating = useMemo( () => status === 'checking', [status] )

    const onSubmit = ( event ) => {
        event.preventDefault()
        dispatch( startLoginWithEmailAndPassword( formState ) )
    }

    const onGoogleSingIn = () => {
        console.log('OnGoogleSingIn')
        dispatch( startGoogleSingIn() )
    }

    return (
        <AuthLayout title="Iniciar Sesión">
            <form aria-label="submit-form" onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
                <Grid container spacing={2.5}>
                    {/* Campo de correo */}
                    <Grid item xs={12}>
                        <TextField
                            label="Correo Electrónico"
                            type="email"
                            placeholder="tu@email.com"
                            fullWidth
                            name="email"
                            value={email}
                            onChange={onInputChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#f8f9fa',
                                    '&:hover': {
                                        backgroundColor: '#f0f2f5'
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Campo de contraseña */}
                    <Grid item xs={12}>
                        <TextField
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            fullWidth
                            name="password"
                            inputProps={{ 'data-testid': 'password' }}
                            value={password}
                            onChange={onInputChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: '#f8f9fa',
                                    '&:hover': {
                                        backgroundColor: '#f0f2f5'
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Mensaje de error */}
                    {!!errorMessage && (
                        <Grid item xs={12}>
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 2,
                                    animation: 'shake 0.5s'
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        </Grid>
                    )}

                    {/* Botón de login principal */}
                    <Grid item xs={12}>
                        <Button
                            disabled={isAuthenticating}
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                    transform: 'translateY(-1px)'
                                },
                                '&:active': {
                                    transform: 'translateY(0)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isAuthenticating ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </Grid>

                    {/* Divider */}
                    <Grid item xs={12}>
                        <Box sx={{ position: 'relative', textAlign: 'center', my: 1 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    px: 2,
                                    bgcolor: 'white',
                                    zIndex: 1
                                }}
                            >
                                o continúa con
                            </Typography>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    bgcolor: 'divider',
                                    zIndex: 0
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* Botón de Google */}
                    <Grid item xs={12}>
                        <Button
                            aria-label="google-btn"
                            disabled={isAuthenticating}
                            onClick={onGoogleSingIn}
                            variant="outlined"
                            fullWidth
                            size="large"
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderColor: 'divider',
                                color: 'text.primary',
                                backgroundColor: 'white',
                                '&:hover': {
                                    backgroundColor: '#f8f9fa',
                                    borderColor: '#667eea',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                },
                                '&:active': {
                                    transform: 'translateY(0)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Google sx={{ mr: 1.5 }} />
                            Continuar con Google
                        </Button>
                    </Grid>

                    {/* Link para crear cuenta */}
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                ¿No tienes una cuenta?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/auth/register"
                                    sx={{
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Regístrate aquí
                                </Link>
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </form>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `}</style>
        </AuthLayout>
    )
}
