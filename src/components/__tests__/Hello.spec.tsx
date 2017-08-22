import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Hello } from '../Hello';

test('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <Hello compiler="TS" framework="React" />,
        div
    );
});
