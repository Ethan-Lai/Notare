import {
    AppShell,
    AppShellMain,
} from "@mantine/core";
import Header from "../components/layout/Header";
import Aside from "../components/layout/Aside";
import Sidebar from '../components/Sidebar';
import Home from "../components/Home";

export default function Index() {
    return (
        <AppShell
            header={{ height: 70 }}
            aside={{ width: "25%" }}
            navbar={{ width: "15%" }}
            padding="md"
        >
            <Header/>
            <Aside/>
            <Sidebar/>

            <AppShellMain>
                <Home />
            </AppShellMain>
        </AppShell>
  );
}

