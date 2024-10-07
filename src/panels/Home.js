import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, Text } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const Home = ({ id, fetchedUser, onLogout }) => {
  const routeNavigator = useRouteNavigator();
  return (
      <Panel id={id}>
        <PanelHeader>Home</PanelHeader>
        {fetchedUser &&
            <Group header={<Header mode="secondary">User Data</Header>}>
              <Cell
                  before={fetchedUser.photo_200 ? <Avatar src={fetchedUser.photo_200}/> : null}
                  description={fetchedUser.city && fetchedUser.city.title ? fetchedUser.city.title : ''}
              >
                {`${fetchedUser.first_name} ${fetchedUser.last_name}`}
              </Cell>
            </Group>
        }

        <Group header={<Header mode="secondary">Navigation</Header>}>
          <Div>
            <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('/profile')} style={{ marginBottom: 16 }}>
              Go to Profile
            </Button>
            <Button stretched size="l" mode="secondary" onClick={onLogout}>
              Log out
            </Button>
          </Div>
        </Group>

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

