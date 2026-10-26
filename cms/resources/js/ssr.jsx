import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";

const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
createServer(
    (page) =>
        createInertiaApp({
            page,
            render: renderToString,
            resolve: (name) => pages[`./Pages/${name}.jsx`],
            setup: ({ App, props }) => <App {...props} />,
        }),
    { host: "127.0.0.1", port: 13714 },
);
