import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, Text } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const Saved = ({id}) => {
    return (
        <Panel id={id}>
            <Group header={<Header mode="secondary">ReadRoom</Header>}>
                <Div>
                    <Text weight="regular" style={{ marginBottom: 16 }}>
                        Welcome to ReadRoom! Here you can explore stories, follow your favorite authors, and share your own tales.
                    </Text>
                    <Text weight="regular">
                        Stay tuned for upcoming features like browsing stories, adding bookmarks, and interacting with other users!
                    </Text>
                </Div>
            </Group>
        </Panel>
    );
};

