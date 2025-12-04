import { Alert, Button, Grid, Link, TextField, Typography, Box } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { AuthLayout } from "../layout/AuthLayout"
import { useForm } from "../../hooks"
import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { startCreatingUserWithEmailPassword } from "../../store/auth/thunks"

const formData = {
    email: '',
    password: '',
    displayName: ''
}

const formValidations = {
    email: [( value ) => value.includes( '@' ), 'El correo debe tener un @'],
    password: [( value ) => value.length >= 6, 'El password debe de tener 6 caracteres'],
    displayName: [( value ) => value.length >= 1, 'El nombre es obligatorio'],
}

export const RegisterPage = () => {

    const dispatch = useDispatch()
    const [formSubmitted, setFormSubmitted] = useState(false)

    const { status, errorMessage } = useSelector( state => state.auth )
    const isCheckingAuthentication = useMemo( () => status === 'checking', [status] )

    const { 
        displayName, email, password, onInputChange, formState, 
        isFormValid, displayNameValid, emailValid, passwordValid
    } = useForm( formData, formValidations )

    const onSubmit = ( event ) => {
        event.preventDefault()
        setFormSubmitted( true )
        if( !isFormValid ) return 
        dispatch( startCreatingUserWithEmailPassword( formState ) )
    }

    return (
        <AuthLayout title="Crear Cuenta">
            <form onSubmit={onSubmit} className="animate__animated animate__fadeIn animate__faster">
                <Grid container spacing={2.5}>
                    {/* Campo de nombre */}
                    <Grid item xs={12}>
                        <TextField
                            label="Nombre Completo"
                            type="text"
                            placeholder="Juan Pérez"
                            fullWidth
                            name="displayName"
                            value={displayName}
                            onChange={onInputChange}
                            error={!!displayNameValid && formSubmitted}
                            helperText={displayNameValid}
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
                            error={!!emailValid && formSubmitted}
                            helperText={emailValid}
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
                            value={password}
                            onChange={onInputChange}
                            error={!!passwordValid && formSubmitted}
                            helperText={passwordValid}
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

                    {/* Botón de registro */}
                    <Grid item xs={12}>
                        <Button
                            disabled={isCheckingAuthentication}
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
                            {isCheckingAuthentication ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                    </Grid>

                    {/* Link para login */}
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                ¿Ya tienes una cuenta?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/auth/login"
                                    sx={{
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Inicia sesión aquí
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
