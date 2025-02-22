import {
    AppShell,
    AppShellMain,
} from "@mantine/core";
import Header from "../components/layout/Header";
import Aside from "../components/layout/Aside";
import Sidebar from '../components/Sidebar';
import Home from "../components/Home";
import { useDisclosure } from "@mantine/hooks";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Index() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <ProtectedRoute>
            <AppShell
                header={{ height: 70 }}
                aside={{ width: "25%" }}
                navbar={{ 
                    width: "15%",
                    collapsed: { desktop: !opened },
                    breakpoint: "sm"
                }}
                padding="md"
            >
                <Header opened={opened} toggle={toggle} />
                <Aside/>
                <Sidebar opened={opened} />

                <AppShellMain>
                    <Home />
                </AppShellMain>
            </AppShell>
        </ProtectedRoute>
  );
}

