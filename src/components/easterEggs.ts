import eggs from '../content/easter-eggs.json';
import type { DialogOptions } from '../hooks/useDialogs';

type Dialog = DialogOptions & { message: string };

const pick = (list: Dialog[]) => list[Math.floor(Math.random() * list.length)];

export const clockSpamDialog = () => pick(eggs.clockSpam as Dialog[]);
export const desktopSpamDialog = () => pick(eggs.desktopSpam as Dialog[]);
export const emptyRecycleBinDialog = () => eggs.emptyRecycleBin as Dialog;
export const restoreDialog = () => eggs.restoreRecycleBin as Dialog;
export const konamiDialog = () => eggs.konami as Dialog;
export const blueScreenText = eggs.blueScreen;
