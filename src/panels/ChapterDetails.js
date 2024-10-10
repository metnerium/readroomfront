import React, { useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    Div,
    Text,
    Title,
    Header,
    SimpleCell,
    InfoRow,
    ScreenSpinner
} from '@vkontakte/vkui';
import { Icon28CalendarOutline } from '@vkontakte/icons';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import bridge from "@vkontakte/vk-bridge";
import api from '../api';

export const ChapterDetails = ({ id }) => {
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const routeNavigator = useRouteNavigator();
    const { chapterId } = useParams();

    useEffect(() => {
        fetchChapterDetails();
    }, [chapterId]);

    const fetchChapterDetails = async () => {
        try {
            setLoading(true);
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const response = await api.get(`/chapters/${chapterId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setChapter(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке главы:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ScreenSpinner />;
    }

    if (!chapter) {
        return <Div>Глава не найдена</Div>;
    }

    return (
        <Panel id={id}>
            <PanelHeader left={<PanelHeaderBack onClick={() => routeNavigator.push(`/historydetails/${chapter.story_id}`)} />}>
                Глава {chapter.chapter_number}
            </PanelHeader>
            <Group>
                <Div>
                    <Title level="1" weight="medium">{chapter.title}</Title>
                </Div>
                <SimpleCell before={<Icon28CalendarOutline />}>
                    <InfoRow header="Дата публикации">
                        {new Date(chapter.created_at).toLocaleDateString()}
                    </InfoRow>
                </SimpleCell>
                {chapter.updated_at && (
                    <SimpleCell before={<Icon28CalendarOutline />}>
                        <InfoRow header="Дата обновления">
                            {new Date(chapter.updated_at).toLocaleDateString()}
                        </InfoRow>
                    </SimpleCell>
                )}
            </Group>
            <Group header={<Header mode="secondary">Содержание</Header>}>
                <Div>
                    <Text>{chapter.content}</Text>
                </Div>
            </Group>
        </Panel>
    );
};
