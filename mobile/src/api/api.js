import axios from "axios";

export const API_ORIGIN =
    "https://guardioes-urbanos-production.up.railway.app";

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`,
    timeout: 10000
});

export function buildAssetUrl(path) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export default api;
