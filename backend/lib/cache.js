const store = new Map();

export const cacheGet = (key) => {
	const entry = store.get(key);
	if (!entry) return null;
	if (entry.expiresAt && Date.now() > entry.expiresAt) {
		store.delete(key);
		return null;
	}
	return entry.value;
};

export const cacheSet = (key, value, ttlSeconds = 300) => {
	store.set(key, {
		value,
		expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
	});
};

export const cacheDel = (key) => store.delete(key);
