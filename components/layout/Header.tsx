import {ActionIcon, AppShellHeader, Flex, Title, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun, IconLogout} from "@tabler/icons-react";
import { useRouter } from 'next/router';

export default function Header() {
    const router = useRouter();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';
    const toggleColorScheme = () => {
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    }

    const handleLogout = () => {
        localStorage.removeItem('userId');
        router.push('/login');
    };

    return (
        <AppShellHeader p="sm">
            <Flex justify="space-between" align="center">
                <Title pl="1rem" >Notare</Title>
                <div className="flex items-center justify-center gap-4">
                    <ActionIcon
                        variant="outline"
                        color={dark ? 'yellow' : 'blue'}
                        onClick={() => toggleColorScheme()}
                        title="Toggle color scheme"
                        size="xl"
                    >
                        {dark ? <IconSun size="1.6rem"></IconSun> : <IconMoon size="1.6rem"></IconMoon>}
                    </ActionIcon>
                    <ActionIcon
                        variant="outline"
                        color={'red'}
                        onClick={() => handleLogout()}
                        title="Toggle color scheme"
                        size="xl"
                    >
                        <IconLogout />
                    </ActionIcon>
                </div>
            </Flex>
        </AppShellHeader>
    )
}