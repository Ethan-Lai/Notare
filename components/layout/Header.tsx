import {ActionIcon, AppShellHeader, Flex, Title, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function Header() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [mounted, setMounted] = useState(false);
    const dark = colorScheme === 'dark';

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <AppShellHeader p="sm">
            <Flex justify="space-between" align="center">
                <Title pl="1rem">Notare</Title>
                {mounted && (
                    <ActionIcon
                        variant="outline"
                        color={dark ? 'yellow' : 'blue'}
                        onClick={() => setColorScheme(dark ? 'light' : 'dark')}
                        title="Toggle color scheme"
                        size="xl"
                    >
                        {dark ? <IconSun size="1.6rem" /> : <IconMoon size="1.6rem" />}
                    </ActionIcon>
                )}
            </Flex>
        </AppShellHeader>
    );
}

