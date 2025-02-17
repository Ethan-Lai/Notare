import "@/styles/globals.css";
import "@mantine/core/styles.css";
import type { AppProps } from "next/app";
import {createTheme, MantineProvider} from "@mantine/core";
import Head from "next/head";

const theme = createTheme({
    // TODO: Set up theme here
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider theme={theme}>
            <Head>
                <title>Notare</title>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </MantineProvider>
    );
}
