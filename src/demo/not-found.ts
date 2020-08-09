import { createNode } from '../vDOM';

export const NotFound = () => (
    createNode('div', { className: 'container' },
        createNode('h1', { className: 'h1' },
            '404',
        ),
        createNode('p', {},
            '😭'
        ),
    )
);
