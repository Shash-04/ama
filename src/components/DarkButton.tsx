"use client";

import { useState, useEffect } from "react";

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    // Check localStorage for saved theme
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    // Toggle dark mode and update localStorage
    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            if (newMode) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
            return newMode;
        });
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white-500 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
    );
}
