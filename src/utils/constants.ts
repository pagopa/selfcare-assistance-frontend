const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const STORAGE_KEY_TOKEN = 'token';

export const LOADING_TASK_SAVE_ASSISTANCE = 'SAVE_ASSISTANCE';
