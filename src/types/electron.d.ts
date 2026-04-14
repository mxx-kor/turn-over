export {};

declare global {
  interface Window {
    electron?: {
      isElectron: boolean;
      closePopup: () => void;
      onUpdateSelectedText: (callback: (text: string) => void) => void;
      openExternalAuth: (url: string) => void;
    };
  }
}
