import { atom } from 'recoil';

export const riveInputState = atom<string>({
  key: 'riveInputState',
  default: '',
});

export const riveThinkingState = atom<boolean>({
  key: 'riveThinkingState',
  default: false,
});
