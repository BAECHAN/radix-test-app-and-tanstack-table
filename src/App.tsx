// src/App.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background: #f2f2f2;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DialogContent = styled(Dialog.DialogContent)`
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const theme = {
  colors: {
    primary: '#6200ee',
  },
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button>다이얼로그 열기</Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed',
              inset: 0,
            }}
          />
          <DialogContent>
            <Dialog.Title style={{ margin: 0, fontSize: '1.25rem' }}>
              다이얼로그 제목
            </Dialog.Title>
            <Dialog.Description style={{ margin: '10px 0 20px' }}>
              Radix UI와 styled-components를 사용한 예제입니다.
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button>닫기</Button>
            </Dialog.Close>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>
    </ThemeProvider>
  );
};

export default App;
