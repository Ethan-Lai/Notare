import "@/styles/globals.css";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import type { AppProps } from "next/app";
import {createTheme, MantineProvider, virtualColor} from "@mantine/core";
import Head from "next/head";
import {Notifications} from "@mantine/notifications";

const theme = createTheme({
    primaryColor: "blue",
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
            <Notifications autoClose={1000} />
            <Component {...pageProps} />
        </MantineProvider>
    );
}
