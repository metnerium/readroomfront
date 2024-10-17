import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-metnerium.ru',
    headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export const login = async (username, password) => {
    const data = {
        grant_type: 'password',
        username: username,
        password: password,
        scope: '',
        client_id: 'string',
        client_secret: 'string'
    };

    try {
        const response = await api.post('/token', data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/users/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export default api;
