import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/ui/chat-workspace/chat-workspace').then(m => m.ChatWorkspace),
  },
];
