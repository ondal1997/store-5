import styled from 'styled-components';

const HighlightedText = styled.strong`
  position: relative;
  font-size: 1.375rem;
  font-weight: bolder;

  ::after {
    position: absolute;
    content: '';
    left: 0;
    right: 0;
    bottom: 0;
    height: 40%;
    background-color: rgba(42, 193, 188, 0.5);
  }
`;

export default HighlightedText;
