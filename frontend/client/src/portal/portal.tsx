import { memo } from 'react';
import ReactDOM from 'react-dom';

const Portal = memo(({ children }) => {
  const el = document.getElementById('portal') as HTMLElement;
  return ReactDOM.createPortal(children, el);
});

export default Portal;
