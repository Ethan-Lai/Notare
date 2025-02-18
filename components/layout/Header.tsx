import {ActionIcon, AppShellHeader, Flex, Title, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons-react";

export default function Header() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';
    const toggleColorScheme = () => {
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    }

    return (
        <AppShellHeader p="sm">
            <Flex justify="space-between" align="center">
                <Title pl="1rem" >Notare</Title>
                <ActionIcon
                    variant="outline"
                    color={dark ? 'yellow' : 'blue'}
                    onClick={() => toggleColorScheme()}
                    title="Toggle color scheme"
                    size="xl"
                >
                    {dark ? <IconSun size="1.6rem"></IconSun> : <IconMoon size="1.6rem"></IconMoon>}
                </ActionIcon>
            </Flex>
        </AppShellHeader>
    )
}