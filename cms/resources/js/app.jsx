import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";

const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
createInertiaApp({
    resolve: (name) => pages[`./Pages/${name}.jsx`],
    setup({ el, App, props }) {
        if (el.hasChildNodes()) hydrateRoot(el, <App {...props} />);
        else createRoot(el).render(<App {...props} />);
    },
    progress: { color: "#45634b" },
});
