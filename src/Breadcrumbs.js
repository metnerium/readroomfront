import React from 'react';
import {Button, Div, Link} from '@vkontakte/vkui';

export const Breadcrumbs = ({ items }) => {
    return (
        <Div>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && " / "}
                    {item.onClick ? (
                        <Button mode={'tertiary'} onClick={item.onClick}>{item.text}</Button>
                    ) : (
                        <Button mode={'tertiary'}>{item.text}</Button>
                    )}
                </React.Fragment>
            ))}
        </Div>
    );
};

