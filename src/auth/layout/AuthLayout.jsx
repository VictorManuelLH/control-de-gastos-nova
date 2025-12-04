import { Grid, Typography, Box, Paper } from "@mui/material";
import { AccountBalanceWallet } from "@mui/icons-material";

export const AuthLayout = ({ children, title = '' }) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 2, sm: 4 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decoración de fondo */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-200px',
                    right: '-200px',
                    filter: 'blur(80px)'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: '-150px',
                    left: '-150px',
                    filter: 'blur(60px)'
                }}
            />

            <Paper
                elevation={24}
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 450 },
                    backgroundColor: 'white',
                    borderRadius: { xs: 3, sm: 4 },
                    padding: { xs: 3, sm: 4 },
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Logo y título */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3
                    }}
                >
                    <Box
                        sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        <AccountBalanceWallet sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Control de Gastos
                    </Typography>
                </Box>

                {/* children */}
                { children }
            </Paper>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
                    }
                }
            `}</style>
        </Box>
    )
}
