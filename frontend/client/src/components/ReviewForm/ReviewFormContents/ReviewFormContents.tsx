import React from 'react';
import styled from 'styled-components';

interface Props {
  contents: string;
  onHandleContents: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ReviewFormContents: React.FC<Props> = ({ contents, onHandleContents }) => {
  return (
    <ReviewFormContentsContainer>
      <Title>후기를 남겨주세요!</Title>
      <ReviewFormTextarea value={contents} onChange={onHandleContents} />
    </ReviewFormContentsContainer>
  );
};

const ReviewFormContentsContainer = styled.div`
  height: 45%;
  padding: 24px 36px;
`;

const Title = styled.div`
  text-align: start;
  color: gray;
  margin-bottom: 24px;
`;

const ReviewFormTextarea = styled.textarea`
  width: 100%;
  height: 85%;
  resize: none;
  border: 1px solid lightgray;
  padding: 12px;
  font-size: 1.2em;
  outline: none;
  font-family: 'Do Hyeon', sans-serif;
  border-radius: 12px;
`;

export default ReviewFormContents;
