import React, { useState, useEffect } from 'react';
import { Panel, PanelHeader, Button, Div, Text } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

const TypewriterText = ({ text, onComplete }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(currentIndex + 1);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [currentIndex, text, onComplete]);

    return (
        <div style={{
            backgroundColor: 'rgb(64,64,64)',
            padding: '20px',
            borderRadius: '10px',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
        }}>
            <Text weight="regular" style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{displayText}</Text>
        </div>
    );
};

export const Welcome = ({ id }) => {
    const [showButton, setShowButton] = useState(false);
    const routeNavigator = useRouteNavigator();

    const welcomeText = `Добро пожаловать в ReadRoom – место в котором слова зажигают воображение!

Раскройте свой творческий потенциал, делитесь литературными шедеврами и погрузитесь в мир захватывающих историй. Здесь каждый найдёт свою аудиторию – от начинающих писателей до заядлых книголюбов.

Присоединяйтесь к нашему яркому сообществу, где каждый голос важен и каждая история находит своего читателя. Давайте вместе создавать будущее литературы!`;

    return (
        <Panel id={id}>
            <PanelHeader>ReadRoom</PanelHeader>
            <Div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <TypewriterText text={welcomeText} onComplete={() => setShowButton(true)} />

                    <Button size="l" width="90" style={{ marginTop: 20 }} onClick={() => routeNavigator.push('/auth')}>
                        Начать путешествие
                    </Button>

            </Div>
        </Panel>
    );
};
