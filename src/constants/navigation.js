import { EXTERNAL_ROUTES, ROUTES } from './routes';

// Navigation menu items configuration
export const NAV_ITEMS = [
  {
    label: 'HOME',
    path: EXTERNAL_ROUTES.COHOPERS_HOME,
    external: true,
  },
  {
    label: 'ABOUT US',
    path: EXTERNAL_ROUTES.COHOPERS_ABOUT,
    external: true,
  },
  {
    label: 'SERVICES',
    path: ROUTES.SERVICES,
    external: false,
  },
  {
    label: 'MEETING ROOM',
    path: ROUTES.MEETING_ROOM,
    external: false,
  },
  {
    label: 'CONTACT US',
    path: EXTERNAL_ROUTES.COHOPERS_CONTACT,
    external: true,
  },
];

export default NAV_ITEMS;
