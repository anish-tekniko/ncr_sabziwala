// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [admin, setAdmin] = useState(() => {
        const savedAdmin = localStorage.getItem("admin");
        return savedAdmin ? JSON.parse(savedAdmin) : null;
    })
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));

    const [vendor, setVendor] = useState(() => {
        const savedVendor = localStorage.getItem('vendor');
        return savedVendor ? JSON.parse(savedVendor) : null;
    })
    const [vendorToken, setVendorToken] = useState(() => localStorage.getItem('vendorToken'))

    const adminLogin = (adminData, adminToken) => {
        setAdmin(adminData);
        setAdminToken(adminToken);
        localStorage.setItem("admin", JSON.stringify(adminData));
        localStorage.setItem("adminToken", adminToken)
    }

    const vendorLogin = (vendorData, vendorToken) => {
        setVendor(vendorData);
        setVendorToken(vendorToken);
        localStorage.setItem("vendor", JSON.stringify(vendorData));
        localStorage.setItem("vendorToken", vendorToken)
    }

    const adminLogout = () => {
        setAdmin(null);
        setAdminToken(null);
        localStorage.removeItem("admin")
        localStorage.removeItem("adminToken")
    }

    const vendorLogout = () => {
        setVendor(null);
        setVendorToken(null);
        localStorage.removeItem("vendor");
        localStorage.removeItem("vendorToken")
    }

    return (
        <AuthContext.Provider value={{ admin, adminToken, vendor, vendorToken, adminLogin, vendorLogin, adminLogout, vendorLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
