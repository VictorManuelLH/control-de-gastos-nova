import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Hook personalizado para usar el contexto de tema
 */
export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext debe ser usado dentro de ThemeProvider');
    }
    return context;
};

/**
 * Proveedor del contexto de tema
 * Maneja el tema activo y la persistencia en localStorage
 */
export const ThemeProvider = ({ children }) => {
    // Obtener tema guardado o usar 'light' por defecto
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        return savedTheme || 'light';
    });

    // Persistir cambios de tema en localStorage
    useEffect(() => {
        localStorage.setItem('appTheme', currentTheme);
    }, [currentTheme]);

    /**
     * Cambia al siguiente tema en la lista
     */
    const toggleTheme = () => {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setCurrentTheme(themes[nextIndex]);
    };

    /**
     * Establece un tema específico
     */
    const setTheme = (themeName) => {
        setCurrentTheme(themeName);
    };

    const value = {
        currentTheme,
        toggleTheme,
        setTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
