import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export const DarkModeButton = () => {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);
    const toggle = () => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        setIsDark(next);
        localStorage.setItem("theme", next ? "dark" : "light"); // optionnel
    };
    return (
        <Button text onClick={toggle} className='text-black dark:text-white px-1 py-1'>
            {isDark
                ? <MdLightMode style={{ width: 24, height: 24 }} />  // soleil → passer en light
                : <MdDarkMode style={{ width: 24, height: 24 }} />  // lune → passer en dark
            }
        </Button>
    );
  };