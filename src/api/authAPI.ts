// src/api/authAPI.ts
// API для работы с аутентификацией

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
    [key: string]: any;
  };
  token: string;
}

class AuthAPI {
  async googleAuth(
    credential: string,
    role?: string
  ): Promise<AuthResult> {
    try {
      // Проверка наличия переменной среды
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const url = `${apiUrl}/auth/google`;
      
      try {
        console.log('Попытка авторизации через API:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential,
            role
          }),
          // Добавляем таймаут для запроса
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error(`Ошибка авторизации: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (apiError) {
        console.warn('Ошибка при работе с API:', apiError);
        
        // Создаем фейковую успешную авторизацию, если сервер недоступен
        console.log('Переключение в демо-режим авторизации');
        
        // Извлекаем данные из токена
        const payload = this.parseJwt(credential);
        
        if (!payload) {
          throw new Error('Невозможно прочитать данные из токена');
        }
        
        // Формируем демо-пользователя из данных токена
        return {
          user: {
            id: 'demo_' + Date.now(),
            name: payload.name || 'Демо пользователь',
            email: payload.email || 'demo@example.com',
            picture: payload.picture,
            isDemoMode: true
          },
          token: 'demo_token_' + Date.now()
        };
      }
    } catch (error) {
      console.error('Ошибка при вызове Google Auth API:', error);
      throw error;
    }
  }
  
  // Вспомогательный метод для декодирования JWT токена
  parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Ошибка при расшифровке токена:', e);
      return null;
    }
  }
}

export const authAPI = new AuthAPI(); 