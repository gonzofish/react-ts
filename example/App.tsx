import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Hello } from '../src/components/Hello';

ReactDOM.render(
    <Hello compiler="TS" framework="React" />,
    document.getElementById('example')
);
