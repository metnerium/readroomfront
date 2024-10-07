import { Panel, PanelHeader, Header, Button, Group, Div, Text } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const Welcome = ({ id }) => {
    const routeNavigator = useRouteNavigator();

    return (
        <Panel id={id}>
            <PanelHeader>Welcome to ReadRoom</PanelHeader>
            <Group header={<Header mode="secondary">About ReadRoom</Header>}>
                <Div>
                    <Text weight="regular" style={{ marginBottom: 16 }}>
                        ReadRoom is a platform where people can share and explore amazing stories.
                        Join our community of readers and writers today!
                    </Text>
                    <Button size="l" stretched style={{ marginBottom: 16 }} onClick={() => routeNavigator.push('/auth')}>
                        Log In / Sign Up
                    </Button>
                </Div>
            </Group>
        </Panel>
    );
};

