import {AppShellAside, Tabs} from "@mantine/core";
import AskGemini from "@/components/gemini/AskGemini";
import {IconFileUpload, IconMessage} from "@tabler/icons-react";

export default function Aside() {
    return (
        <AppShellAside p="md">
            <Tabs defaultValue="chat">
                <Tabs.List grow>
                    <Tabs.Tab value="chat" leftSection={<IconMessage size={20} />}>
                        Chat
                    </Tabs.Tab>
                    <Tabs.Tab value="upload" leftSection={<IconFileUpload size={20} />}>
                        Upload
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="chat" mt="sm">
                    <AskGemini />
                </Tabs.Panel>
            </Tabs>
        </AppShellAside>
    )
}