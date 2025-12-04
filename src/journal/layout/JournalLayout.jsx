import { Box } from "@mui/system"
import { Navbar, SideBar } from "../components"
import { Toolbar } from "@mui/material"
import { useState } from "react";

const drawerWidth = 240

export const JournalLayout = ({ children }) => {

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    }

    return (
        <Box sx={{ display: 'flex' }} className="animate__animated animate__fadeIn animate__faster" >

            <Navbar drawerWidth={drawerWidth} setOpen={handleDrawerToggle} />

            <SideBar drawerWidth={drawerWidth} openSidebar={mobileOpen} setOpen={handleDrawerToggle} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    pb: { xs: 10, sm: 3 }, // Padding inferior extra en móvil para bottom nav
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden'
                }}
            >

                <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }} />

                { children }

            </Box>

        </Box>
    )
}
